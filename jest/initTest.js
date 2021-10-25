import EventEmitter from "events";
import { createStore } from "redux";
import BOS3D from 'BOS3D';
import reducer from "../src/UI/reducer";

export function genStore() {
  const ee = new EventEmitter();
  const viewer3D = new BOS3D.Viewer();

  return createStore(reducer, {
    system: {
      viewer3D,
      BIMWINNER: { BOS3D },
      apiVersion: 'api',
      eventEmitter: ee,
    }
  });
}
