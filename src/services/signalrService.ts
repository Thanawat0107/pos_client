/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD"; // https://localhost:7061

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  startConnection() {
    // ถ้ามีการเชื่อมต่ออยู่แล้ว หรือกำลังเชื่อมต่อ ไม่ต้องทำซ้ำ
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      // ปรับ Path ให้ตรงกับ app.MapHub<OrderHub>("/orderHub")
      .withUrl(`${baseUrl}/orderHub`, {
        // ดึง Token จาก LocalStorage ไปใส่ใน Query String 
        // ตามที่ Backend รอรับใน u.Events = new JwtBearerEvents { OnMessageReceived = ... }
        accessTokenFactory: () => {
          const token = localStorage.getItem("token");
          return token ? token : "";
        }
      })
      .withAutomaticReconnect() // ต่ออัตโนมัติถ้าเน็ตหลุด
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection
      .start()
      .then(() => console.log("✅ SignalR: OrderHub Connected!"))
      .catch((err) => {
        console.error("❌ SignalR: Connection Failed: ", err);
        // พยายามต่อใหม่ทุก 5 วินาทีถ้าล้มเหลวครั้งแรก
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  // ฟังก์ชันสำหรับฟังเหตุการณ์จาก Server (เช่น ReceiveNewContent, ContentUpdated)
  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) return;
    this.connection.on(eventName, callback);
  }

  // ฟังก์ชันสำหรับยกเลิกการฟังเหตุการณ์
  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.connection) return;
    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }
  }

  // ฟังก์ชันส่งข้อมูลกลับไปหา Server (ถ้ามี)
  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return await this.connection.invoke(methodName, ...args);
    }
  }

  // ปิดการเชื่อมต่อ
  stopConnection() {
    this.connection?.stop()
      .then(() => console.log("SignalR: Connection Stopped"));
  }
}

export const signalRService = new SignalRService();