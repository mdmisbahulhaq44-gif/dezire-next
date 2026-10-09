import { ImageResponse } from "next/og"

export const dynamic = "force-static"
export const alt = "HEAVEN - Premium Fashion in Bangladesh"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: 20 }}>HEAVEN</div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#bbb" }}>Premium Fashion in Bangladesh</div>
      </div>
    ),
    size
  )
}
