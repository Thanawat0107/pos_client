import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";

// function Get Action
export const useAppDispatch = () => useDispatch<AppDispatch>();
// function Get State
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;