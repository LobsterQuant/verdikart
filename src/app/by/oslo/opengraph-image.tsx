import {
  cityOgAlt,
  cityOgContentType,
  cityOgSize,
  renderCityOgImage,
} from "../_cityOgImage";

/**
 * Explicit /by/oslo OG route. Needed because /by/oslo has a [bydel] subfolder
 * that would otherwise catch "opengraph-image" as a bydel slug. This file
 * shadows that catch and routes to the shared city renderer.
 */
export const runtime = "edge";
export const alt = cityOgAlt;
export const size = cityOgSize;
export const contentType = cityOgContentType;

export default function OgImage() {
  return renderCityOgImage("oslo");
}
