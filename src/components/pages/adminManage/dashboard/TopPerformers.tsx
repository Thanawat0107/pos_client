/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { Paper, Typography, Avatar, IconButton, Button } from "@mui/material";
import { Crown, MoreVertical } from "lucide-react";

const TopPerformers = ({ items }: { items: any[] }) => (
  <Paper
    elevation={0}
    className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl relative border border-slate-800 h-full"
  >
    <div className="flex justify-between items-center mb-8 relative z-10">
      <Typography variant="h6" className="font-bold flex items-center gap-2">
        <Crown size={20} className="text-amber-400" /> สินค้าขายดีที่สุด
      </Typography>
      <IconButton size="small" className="text-slate-400">
        <MoreVertical size={20} />
      </IconButton>
    </div>
    <div className="space-y-5 relative z-10">
      {items?.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Avatar
              sx={{
                bgcolor: idx === 0 ? "#fbbf24" : "#334155",
                color: idx === 0 ? "#000" : "#fff",
                fontWeight: "bold",
              }}
            >
              {idx + 1}
            </Avatar>
            <div>
              <Typography variant="subtitle2" className="font-bold">
                {item.menuItemName}
              </Typography>
              <Typography variant="caption" className="text-slate-400">
                {item.totalQuantity} Bowls sold
              </Typography>
            </div>
          </div>
          <Typography variant="subtitle1" className="font-black text-amber-400">
            {item.totalRevenue.toLocaleString()}฿
          </Typography>
        </motion.div>
      ))}
    </div>
    <Button
      fullWidth
      className="mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold"
    >
      รายละเอียดทั้งหมด
    </Button>
  </Paper>
);

export default TopPerformers;
