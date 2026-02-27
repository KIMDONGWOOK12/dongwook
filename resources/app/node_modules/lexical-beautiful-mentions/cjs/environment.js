"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_MOBILE = exports.IS_IOS = exports.CAN_USE_DOM = void 0;
exports.CAN_USE_DOM = typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    typeof window.document.createElement !== "undefined";
exports.IS_IOS = exports.CAN_USE_DOM &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-expect-error window.MSStream
    !window.MSStream;
exports.IS_MOBILE = exports.CAN_USE_DOM && window.matchMedia("(pointer: coarse)").matches;
