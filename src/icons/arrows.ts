import { arc, head, line, poly, polar } from "../engine/shapes.js";
import { icon } from "./types.js";

export const arrowRight = icon("arrow-right", [line(4.5, 12, 19, 12), head(19, 12, 0, 6)]);
export const arrowLeft = icon("arrow-left", [line(19.5, 12, 5, 12), head(5, 12, 180, 6)]);
export const arrowUp = icon("arrow-up", [line(12, 19.5, 12, 5), head(12, 5, -90, 6)]);
export const arrowDown = icon("arrow-down", [line(12, 4.5, 12, 19), head(12, 19, 90, 6)]);
export const arrowUpRight = icon("arrow-up-right", [line(6.5, 17.5, 17, 7), poly([[8.5, 7], [17, 7], [17, 15.5]])]);

export const chevronRight = icon("chevron-right", [poly([[9, 5.5], [15.5, 12], [9, 18.5]])]);
export const chevronLeft = icon("chevron-left", [poly([[15, 5.5], [8.5, 12], [15, 18.5]])]);
export const chevronUp = icon("chevron-up", [poly([[5.5, 15], [12, 8.5], [18.5, 15]])]);
export const chevronDown = icon("chevron-down", [poly([[5.5, 9], [12, 15.5], [18.5, 9]])]);

const refreshEnd = polar(12, 12, 8, 8, 300);
export const refresh = icon("refresh", [arc(12, 12, 8, 8, 20, 300), head(refreshEnd[0], refreshEnd[1], 30, 4.5)]);

export const externalLink = icon("external-link", [
  poly([[18, 13.5], [18, 19.5], [4.5, 19.5], [4.5, 6], [10.5, 6]]),
  line(10.5, 13.5, 19.5, 4.5),
  poly([[14, 4.5], [19.5, 4.5], [19.5, 10]]),
]);

const tray = poly([[4, 15], [4, 20], [20, 20], [20, 15]]);
export const download = icon("download", [line(12, 3.5, 12, 15), head(12, 15, 90, 5.5), tray]);
export const upload = icon("upload", [line(12, 15.5, 12, 4), head(12, 4, -90, 5.5), tray]);

export const send = icon("send", [
  poly([[21, 3], [3, 10.5], [10.5, 13.5], [13.5, 21]], true),
  line(10.5, 13.5, 21, 3),
]);

export const trendingUp = icon("trending-up", [
  poly([[2.5, 17.5], [9, 11], [13, 15], [21, 7]]),
  poly([[15, 7], [21, 7], [21, 13]]),
]);
export const trendingDown = icon("trending-down", [
  poly([[2.5, 6.5], [9, 13], [13, 9], [21, 17]]),
  poly([[15, 17], [21, 17], [21, 11]]),
]);
