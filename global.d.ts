import { Dispatch, SetStateAction } from "react";
declare global {
  type State<S> = [S, Dispatch<SetStateAction<S>>];
}
