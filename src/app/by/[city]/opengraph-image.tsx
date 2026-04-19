import {
  cityOgAlt,
  cityOgContentType,
  cityOgSize,
  renderCityOgImage,
} from "../_cityOgImage";

export const runtime = "edge";
export const alt = cityOgAlt;
export const size = cityOgSize;
export const contentType = cityOgContentType;

export default function OgImage({ params }: { params: { city: string } }) {
  return renderCityOgImage(params.city);
}
