/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD"; // ตรวจสอบ Path ให้ตรงกับโปรเจคคุณ
import { jwtDecode } from "jwt-decode"; 

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: { [eventName: string]: Array<(...args: any[]) => void> } = {};
  private startPromise: Promise<void> | null = null;
  // ✅ เก็บ callbacks สำหรับ re-join groups หลัง reconnect
  private reconnectedCallbacks: Array<() => void> = [];

  public get connectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  addReconnectedCallback(fn: () => void) {
    this.reconnectedCallbacks.push(fn);
  }

  removeReconnectedCallback(fn: () => void) {
    this.reconnectedCallbacks = this.reconnectedCallbacks.filter(cb => cb !== fn);
  }

  async reconnect() {
    console.log("🔄 SignalR: Reconnecting...");
    await this.stopConnection();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.startConnection();
  }

  async startConnection() {
    if (this.startPromise) {
      return this.startPromise;
    }

    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    this.startPromise = this._startInternal();

    try {
      await this.startPromise;
    } catch (err: any) {
      console.error("❌ SignalR Start Error:", err);
      // ✅ ตั้ง retry เพื่อให้ reconnect เองช่วงหลัง
      setTimeout(() => { this.startConnection(); }, 5000);
      throw err; // ✅ rethrow เพื่อให้ caller รู้ว่า fail
    } finally {
      this.startPromise = null;
    }
  }

  private async _startInternal() {
    const cartToken = localStorage.getItem("cartToken") || "";
    // ปรับ URL ตาม Logic เดิมของคุณ
    const hubUrl = `${baseUrl.replace(/\/api\/?$/, "")}/orderHub`;

    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
       await this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?cartToken=${cartToken}`, {
        accessTokenFactory: () => {
           const token = localStorage.getItem("token");
           if (!token) return "";
           
           try {
             const decoded: any = jwtDecode(token);
             const currentTime = Date.now() / 1000;
             if (decoded.exp < currentTime) return "";
           } catch { return ""; }

           return token;
        },
     skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets 
          | signalR.HttpTransportType.LongPolling,
        withCredentials: true,
      })
      // ✅ ลบ DefaultReconnectPolicy ออก ใช้ withAutomaticReconnect() แทน
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // 🔥 2. Re-register Events: วนลูปผูกทุก function ใน Array กลับเข้าไปใหม่
    // (เพราะถ้า Connection สร้างใหม่ Event ที่ผูกไว้กับ object เก่าจะหายไป)
    Object.keys(this.eventHandlers).forEach((eventName) => {
      this.eventHandlers[eventName].forEach((callback) => {
        if (this.connection) {
             this.connection.on(eventName, callback);
        }
      });
    });

    // ✅ Re-join groups เมื่อ withAutomaticReconnect reconnect สำเร็จ
    this.connection.onreconnected(() => {
      console.log("🔄 SignalR: Reconnected! Re-joining groups...");
      this.reconnectedCallbacks.forEach(fn => fn());
    });

    // ✅ throw error ออกมา ไม่กินแบบเงียบ เพื่อให้ caller รู้ว่า connect fail
    await this.connection.start();
    console.log("✅ SignalR: Connected!");
  }

  async stopConnection() {
    if (this.startPromise) {
        try { await this.startPromise; } catch { /* ignore error */ }
    }

    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("🛑 SignalR: Stopped");
      } catch (err) {
        console.error("Error stopping SignalR:", err);
      } finally {
        this.connection = null;
      }
    }
  }

  // 🔥 3. ปรับปรุง ON: เพิ่มใส่ Array ไม่ทับของเดิม
  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    // เพิ่มเข้า List
    this.eventHandlers[eventName].push(callback);

    // บอก SignalR ให้เรียก callback นี้ด้วย
    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  // 🔥 4. ปรับปรุง OFF: ลบเฉพาะ callback ที่ส่งมา
  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.connection) return;

    if (callback) {
      // 4.1 ลบออกจาก SignalR เฉพาะตัวนี้
      this.connection.off(eventName, callback);
      
      // 4.2 ลบออกจาก List ภายในของเรา
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(cb => cb !== callback);
      }
    } else {
      // ⚠️ ถ้าไม่ส่ง callback มา -> ลบหมด (Reset Event นั้น)
      this.connection.off(eventName);
      delete this.eventHandlers[eventName];
    }
  }

  // 🔥 เพิ่ม: Join Order Group เพื่อรับการอัปเดตออเดอร์ของลูกค้า
  async joinOrderGroup(orderId: number | string) {
    try {
      await this.invoke("JoinOrderGroup", orderId.toString());
      console.log(`✅ Joined order group: ${orderId}`);
    } catch (err) {
      console.error(`❌ Failed to join order group ${orderId}:`, err);
    }
  }

  // 🔥 เพิ่ม: Join Cart Group เพื่อรับการอัปเดตตะกร้า
  async joinCartGroup(cartToken: string) {
    try {
      await this.invoke("JoinCartGroup", cartToken);
      console.log(`✅ Joined cart group: ${cartToken}`);
    } catch (err) {
      console.error(`❌ Failed to join cart group:`, err);
    }
  }

  // 🔥 เพิ่ม: Join User Group เพื่อรับการแจ้งเตือนส่วนตัว
  async joinUserGroup(userToken: string) {
    try {
      await this.invoke("JoinUserGroup", userToken);
      console.log(`✅ Joined user group: ${userToken}`);
    } catch (err) {
      console.error(`❌ Failed to join user group:`, err);
    }
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.startPromise) await this.startPromise;

    // ✅ ถ้ายัง Connecting อยู่ ให้รอจนกว่าจะ Connected (max 5 วินาที)
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      const timeout = Date.now() + 5000;
      await new Promise<void>((resolve) => {
        const check = () => {
          if (
            this.connection?.state === signalR.HubConnectionState.Connected ||
            Date.now() > timeout
          ) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        return await this.connection.invoke(methodName, ...args);
      } catch (err) {
        console.error(`Error invoking ${methodName}:`, err);
      }
    } else {
      console.warn(`Cannot invoke ${methodName}, SignalR state: ${this.connection?.state}`);
    }
  }
}

export const signalRService = new SignalRService();