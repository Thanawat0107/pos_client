/* eslint-disable @typescript-eslint/no-explicit-any */
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../helpers/SD";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  // ⭐ เพิ่มฟังก์ชัน Reconnect
  async reconnect() {
    console.log("🔄 SignalR: Reconnecting with new tokens...");
    await this.stopConnection();
    this.startConnection();
  }

  startConnection() {
    // 🛡️ Guard: ถ้ากำลังเชื่อมต่อหรือเชื่อมต่ออยู่แล้ว ไม่ต้องทำอะไร
    if (
      this.connection &&
      (this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting)
    ) {
      console.log("⚠️ SignalR: Connection is already starting or connected.");
      return;
    }

    const cartToken = localStorage.getItem("cartToken") || "";

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/orderHub?cartToken=${cartToken}`, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => console.log("✅ SignalR: OrderHub Connected!"))
      .catch((err) => {
        // ถ้าเป็นการสั่งหยุดโดยความตั้งใจ (เช่น เปลี่ยนหน้า หรือ React สั่งรันใหม่) ไม่ต้องพ่น Error แดง
        if (
          err.name === "AbortError" ||
          err.message.includes("stopped during negotiation")
        ) {
          console.log("ℹ️ SignalR: Connection aborted as expected.");
        } else {
          console.error("❌ SignalR: Connection Failed: ", err);
          if (this.connection) {
            setTimeout(() => this.startConnection(), 5000);
          }
        }
      });
  }

  stopConnection(): Promise<void> {
    if (this.connection) {
      return this.connection
        .stop()
        .then(() => {
          console.log("SignalR: Connection Stopped");
          this.connection = null; // 🚩 สำคัญมาก: ล้าง instance ทิ้งเพื่อให้ startConnection สร้างใหม่ได้สะอาด
        })
        .catch((err) => console.error("Stop error", err));
    }
    return Promise.resolve();
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) return;
    this.connection.on(eventName, callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.connection) return;
    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return await this.connection.invoke(methodName, ...args);
    }
  }
}

export const signalRService = new SignalRService();
