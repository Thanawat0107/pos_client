/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD";
import { jwtDecode } from "jwt-decode"; 

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: { [eventName: string]: (...args: any[]) => void } = {};

  // 🔥 2. เพิ่มตัวแปรนี้เพื่อใช้เป็น "กุญแจล็อค" (ป้องกัน Race Condition)
  private startPromise: Promise<void> | null = null;

  async reconnect() {
    console.log("🔄 SignalR: Reconnecting...");
    await this.stopConnection();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.startConnection();
  }

  // 🔥 3. ปรับ Logic startConnection ให้เช็ค Lock ก่อน
  async startConnection() {
    // ถ้ามีใครกำลัง Start อยู่แล้ว ให้รอตัวนั้นเลย ไม่ต้องสร้างใหม่
    if (this.startPromise) {
      return this.startPromise;
    }

    // ถ้าต่อติดแล้ว ก็จบ
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    // เริ่มสร้าง Connection และเก็บ Promise ไว้ในตัวแปรล็อค
    this.startPromise = this._startInternal();

    try {
      await this.startPromise;
    } finally {
      // เมื่อจบงาน (ไม่ว่าจะสำเร็จหรือล้มเหลว) ให้ปลดล็อค
      this.startPromise = null;
    }
  }

  // 🔥 4. แยก Logic การเชื่อมต่อจริงมาไว้ที่นี่ (Internal function)
  private async _startInternal() {
    const cartToken = localStorage.getItem("cartToken") || "";
    const hubUrl = `${baseUrl.replace(/\/api\/?$/, "")}/orderHub`;

    // ถ้า connection เก่าค้างอยู่ ให้เคลียร์ก่อน
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
       await this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?cartToken=${cartToken}`, {
        accessTokenFactory: () => {
           const token = localStorage.getItem("token");
           if (!token) return "";
           
           // 🔥 เช็คว่า Token หมดอายุหรือยัง? (ถ้าหมดแล้วส่งค่าว่างไปเลย กัน Error 401)
           try {
             const decoded: any = jwtDecode(token);
             const currentTime = Date.now() / 1000;
             if (decoded.exp < currentTime) return "";
           } catch { return ""; }

           return token;
        },
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Re-register Events
    Object.keys(this.eventHandlers).forEach((eventName) => {
      if (this.connection) {
        this.connection.off(eventName); // กันเหนียว ลบของเก่า
        this.connection.on(eventName, this.eventHandlers[eventName]);
      }
    });

    try {
      await this.connection.start();
      console.log("✅ SignalR: Connected!");
    } catch (err: any) {
      console.error("❌ SignalR Start Error:", err);
      // Retry logic (Recursive call ผ่าน startConnection หลัก)
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  // 🔥 5. ปรับ stopConnection ให้ "รอ" ถ้ากำลัง Start อยู่
  async stopConnection() {
    // ถ้าระบบกำลัง Start อยู่ อย่าเพิ่งไปขัดขา รอให้เสร็จก่อน
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

  // ... ส่วน on, off, invoke เหมือนเดิมครับ ...
  on(eventName: string, callback: (...args: any[]) => void) {
    this.eventHandlers[eventName] = callback;
    if (this.connection) {
      this.connection.off(eventName);
      this.connection.on(eventName, callback);
    }
  }

  off(eventName: string) {
    delete this.eventHandlers[eventName];
    if (this.connection) {
      this.connection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]) {
    // รอให้ Start เสร็จก่อนค่อย Invoke
    if (this.startPromise) await this.startPromise;

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        return await this.connection.invoke(methodName, ...args);
      } catch (err) {
        console.error(`Error invoking ${methodName}:`, err);
      }
    } else {
      console.warn("Cannot invoke, SignalR not connected.");
    }
  }
}

export const signalRService = new SignalRService();