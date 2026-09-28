import { arc, circle, dot, ellipse, line, poly, rect } from "../engine/shapes.js";
import { icon } from "./types.js";

export const check = icon("check", [poly([[4, 12.5], [9.5, 18], [20, 6]])]);
export const x = icon("x", [line(6, 6, 18, 18), line(18, 6, 6, 18)]);
export const plus = icon("plus", [line(12, 5, 12, 19), line(5, 12, 19, 12)]);
export const minus = icon("minus", [line(5, 12, 19, 12)]);
export const menu = icon("menu", [line(4, 6.5, 20, 6.5), line(4, 12, 20, 12), line(4, 17.5, 20, 17.5)]);
export const search = icon("search", [circle(10.5, 10.5, 6.5), line(15.5, 15.5, 20.5, 20.5)]);

export const home = icon("home", [
  poly([[2.5, 11.5], [12, 3.5], [21.5, 11.5]]),
  poly([[5.5, 9.5], [5.5, 20.5], [18.5, 20.5], [18.5, 9.5]]),
  poly([[10, 20.5], [10, 14.5], [14, 14.5], [14, 20.5]]),
]);

export const user = icon("user", [circle(12, 8, 4), arc(12, 21, 7.5, 7, 180, 360)]);

export const bell = icon("bell", [
  "M6 17 L6 11 C6 7.6 8.7 5 12 5 C15.3 5 18 7.6 18 11 L18 17",
  line(4, 17, 20, 17),
  arc(12, 19, 2.2, 1.8, 0, 180),
  line(12, 3, 12, 5),
]);

export const calendar = icon("calendar", [
  rect(3.5, 5, 17, 15.5, 2),
  line(3.5, 10, 20.5, 10),
  line(8, 3, 8, 7),
  line(16, 3, 16, 7),
]);

export const clock = icon("clock", [circle(12, 12, 9), poly([[12, 7], [12, 12], [15.5, 14]])]);

export const mail = icon("mail", [rect(3, 5.5, 18, 13, 2), poly([[3.5, 7], [12, 13], [20.5, 7]])]);

export const lock = icon("lock", [
  rect(5, 11, 14, 10, 2),
  "M8 11 L8 7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 L16 11",
  line(12, 15, 12, 17),
]);

export const unlock = icon("unlock", [
  rect(5, 11, 14, 10, 2),
  "M8 11 L8 7.5 C8 5 9.8 3.5 12 3.5 C13.8 3.5 15.3 4.5 15.8 6",
  line(12, 15, 12, 17),
]);

export const eye = icon("eye", [
  "M2.5 12 C5 7.5 8.3 5.5 12 5.5 C15.7 5.5 19 7.5 21.5 12 C19 16.5 15.7 18.5 12 18.5 C8.3 18.5 5 16.5 2.5 12 Z",
  circle(12, 12, 3),
]);

export const sliders = icon("sliders", [
  line(4, 6, 7, 6), circle(9, 6, 2), line(11, 6, 20, 6),
  line(4, 12, 13, 12), circle(15, 12, 2), line(17, 12, 20, 12),
  line(4, 18, 6, 18), circle(8, 18, 2), line(10, 18, 20, 18),
]);

export const link = icon("link", [
  "M10 13.5 C11.4 15.2 13.9 15.4 15.5 13.8 L18.5 10.8 C20 9.3 20 6.8 18.5 5.4 C17.1 4 14.7 4 13.2 5.4 L11.8 6.8",
  "M14 10.5 C12.6 8.8 10.1 8.6 8.5 10.2 L5.5 13.2 C4 14.7 4 17.2 5.5 18.6 C6.9 20 9.3 20 10.8 18.6 L12.2 17.2",
]);

export const trash = icon("trash", [
  line(3.5, 6.5, 20.5, 6.5),
  poly([[6, 6.5], [7, 20.5], [17, 20.5], [18, 6.5]]),
  poly([[9, 6.5], [9, 3.5], [15, 3.5], [15, 6.5]]),
  line(10, 10.5, 10, 16.5),
  line(14, 10.5, 14, 16.5),
]);

export const edit = icon("edit", [
  poly([[16, 3.5], [20.5, 8], [9, 19.5], [3.5, 20.5], [4.5, 15]], true),
  line(13.5, 6, 18, 10.5),
]);

export const info = icon("info", [circle(12, 12, 9), line(12, 11, 12, 16.5), dot(12, 7.8)]);

export const alert = icon("alert", [
  poly([[12, 3.5], [21.5, 20], [2.5, 20]], true),
  line(12, 9.5, 12, 14),
  dot(12, 17),
]);

export const help = icon("help", [
  circle(12, 12, 9),
  "M9.3 9.5 C9.6 7.9 10.7 7 12.1 7 C13.7 7 14.9 8.1 14.9 9.5 C14.9 11.3 12.2 11.6 12.2 13.6",
  dot(12.2, 16.6),
]);

export const file = icon("file", [
  poly([[5, 3], [14, 3], [19, 8], [19, 21], [5, 21]], true),
  poly([[14, 3], [14, 8], [19, 8]]),
]);

export const folder = icon("folder", [poly([[3, 5], [9, 5], [11, 7.5], [21, 7.5], [21, 19], [3, 19]], true)]);

export const code = icon("code", [poly([[8, 7], [3, 12], [8, 17]]), poly([[16, 7], [21, 12], [16, 17]])]);
export const terminal = icon("terminal", [poly([[4, 7], [9, 12], [4, 17]]), line(12, 17.5, 20, 17.5)]);

export const cart = icon("cart", [
  poly([[2.5, 3.5], [5.5, 3.5], [8, 15], [18.5, 15], [20.5, 7], [6.5, 7]]),
  circle(9, 19.5, 1.4),
  circle(17.5, 19.5, 1.4),
]);

export const message = icon("message", [
  poly([[3.5, 4], [20.5, 4], [20.5, 16.5], [10, 16.5], [5, 20.5], [5, 16.5], [3.5, 16.5]], true),
]);

export const camera = icon("camera", [
  rect(2.5, 7, 19, 13, 2),
  poly([[8, 7], [9.5, 4.5], [14.5, 4.5], [16, 7]]),
  circle(12, 13.5, 3.5),
]);

export const image = icon("image", [
  rect(3.5, 4.5, 17, 15, 2),
  circle(9, 9.5, 1.6),
  poly([[4, 18], [10, 12.5], [13.5, 15.5], [16, 13.5], [20, 17]]),
]);

export const music = icon("music", [
  poly([[9, 17.5], [9, 5], [19, 3], [19, 15.5]]),
  ellipse(6.8, 17.5, 2.2, 2.2),
  ellipse(16.8, 15.5, 2.2, 2.2),
]);
