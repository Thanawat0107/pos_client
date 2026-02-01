/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD"; // ตรวจสอบ Path ให้ตรงกับโปรเจคคุณ
import { jwtDecode } from "jwt-decode"; 

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: { [eventName: string]: Array<(...args: any[]) => void> } = {};
  private startPromise: Promise<void> | null = null;
  public get connectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  async reconnect() {
    console.log("🔄 SignalR: Reconnecting...");
    await this.stopConnection();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.startConnection();
  }

  async startConnection() {
    // Lock logic (เหมือนเดิม)
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
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
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

    try {
      await this.connection.start();
      console.log("✅ SignalR: Connected!");
    } catch (err: any) {
      console.error("❌ SignalR Start Error:", err);
      setTimeout(() => this.startConnection(), 5000);
    }
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

  async invoke(methodName: string, ...args: any[]) {
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