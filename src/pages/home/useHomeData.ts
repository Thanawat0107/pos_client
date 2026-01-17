/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from "react";
import { useGetMenuItemsQuery } from "../../services/menuItemApi";
import { useGetContentsQuery } from "../../services/contentApi";
import { ContentType } from "../../@types/Enum";
import type { MenuItemDto } from "../../@types/dto/MenuItem";
import type { Content } from "../../@types/dto/Content";

export const useHomeData = () => {
  const [cat, setCat] = useState<string>("pizza");

  // Fetch Data
  const { data: menuData, isLoading: menuLoading, isError: menuError } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 6,
  });

  const { data: contentData, isLoading: contentLoading } = useGetContentsQuery({
    pageNumber: 1,
    pageSize: 100
  });

  // Prepare Data
  const menuItems: MenuItemDto[] = menuData?.result ?? [];
  const contents: Content[] = contentData?.result ?? [];

  // Logic แยกประเภท
  const { promotions, news, banners } = useMemo(() => {
    const now = new Date();
    const active = contents.filter((c) => {
      const start = new Date(c.startDate);
      const isNotExpired = !c.endDate || new Date(c.endDate) >= now;
      return c.isUsed && start <= now && isNotExpired;
    });

    return {
      banners: active
        .filter((c) => c.imageUrl && c.imageUrl.trim() !== "")
        .slice(0, 5),
      promotions: active.filter((c) => c.contentType === ContentType.PROMOTION),
      news: active.filter(
        (c) => c.contentType === ContentType.NEWS || c.contentType === ContentType.EVENT
      ),
    };
  }, [contents]);

  return {
    cat,
    setCat,
    menuItems,
    banners,
    promotions,
    news,
    isLoading: menuLoading || contentLoading,
    menuError,
  };
};