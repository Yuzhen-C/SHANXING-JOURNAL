// Miniature pen-and-ink landmarks share the same ground line at local y=0.
function pine(x: number, y: number, scale: number) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke="#41594a" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-2 0Q2-3 1-7L-1-11Q-2-14 1-18M0-6L5-10M-1-11L-6-13M0-15L4-17" fill="none"/>
    <g fill="#778370" stroke-width=".5">
      <path d="M-9-12q1-3 3-2 2-4 4 0l2 1q-5 1-9 1Z"/>
      <path d="M1-9q2-3 4-3 2-2 3 0 2-1 3 1-4 2-10 2Z"/>
      <path d="M-4-17q1-2 3-2 2-3 4-1 2-1 4 1-4 1-11 2Z"/>
    </g>
  </g>`
}

function hall(x: number, y: number, scale: number) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke="#425546" stroke-width="1" stroke-linejoin="round">
    <path d="M-12 0L0-1 12 0M-9-1v-7m4 7v-7m10 7v-7m4 7v-7" fill="none"/>
    <path d="M-14-10q4 2 8-2l3-3h6l4 4q4 3 7 1-3 4-6 4H-9q-3 0-5-4Z" fill="#84917c"/>
    <path d="M-5-16q1 2 3 1h4q2 1 4-1M-10-8Q0-6 10-8" fill="none"/>
    <path d="M-3-1v-5h6v5" fill="#596c5b"/>
  </g>`
}

const stops = [[25,106], [81,90], [129,72], [163,65], [185,52], [218,47], [255,36]]

export function trailMap(): string {
  return `<svg class="trail-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306 134" width="100%" role="img" aria-label="登岱路线示意图：从左下方天外村，经中天门、南天门、天街、碧霞祠、大观峰，至右上方玉皇顶。">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Fine distant ridges, interrupted by the paper-white mist. -->
    <g stroke="#82927d" stroke-width=".75" opacity=".75">
      <path d="M4 76q8-3 15-13l7-3 11-16 5-1 8 11 5 1 7 8 10-11 5-1 15-20 5-2 8 11 7 5 7 9"/>
      <path d="M42 45l1 8 9 12m44-32 3 10 8 9m2-4 5 7"/>
      <path d="M111 51l9-8 9-4 13-18 4-2 6 6 3 8 10 6 7-2 7-8 4-1 8-9 5 3 4 5"/>
      <path d="M145 21l-2 11-5 6m17-6 4 10m23-11 7-3 5-7"/>
      <path d="M212 30l9-7 4-1 8-9 4 1 5 8m19 9 9-4 9-12 4 1 6 11 10 7m-17-16 3 11"/>
    </g>
    <g stroke="#718271" stroke-width=".8" opacity=".48">
      <path d="M5 42h10q6 0 10-3h13m12-15h13q5 0 8-3h15M3 46h13m274 2h11M122 16h10"/>
      <path d="M223 96h16q7 0 9-4h17m-24 8h12m-146 18h21q4 0 8-3h8m32 4h9"/>
    </g>
    <!-- Broken outlines and short interior strokes describe the rock faces. -->
    <g stroke="#556c59" stroke-width="1.05">
      <path d="M2 104l8-2 7-8 8-3 11-16 5-2 7-11 5 1 7 8 8 3 6 8 8-2m-33-15-3 7-7 4-4 9m17-14 7 8 5 1"/>
      <path d="M45 103l12-8 8-1 7-7m11-7 9-10 6-2 10-17 6-3 6 2 5-6 3 1 4 10 7 5m-26-9-2 9-7 8-6 4m25-23 1 9 5 6"/>
      <path d="M102 97l11-8 12-3 6-6m8 0 7-9m-8-14 8-10 6-2 7-10 5 1 7 9 6 1m-14-8-5 13-7 4"/>
      <path d="M179 49l8-16 4-2 4-7 4-1 7 10 5 2 5 8m-19-18-2 9-5 8m11-10 3 10"/>
      <path d="M220 43l7-6 4-9 7-2 3 3m18 5 7 8 8 3 10 11 7 2 11 10m-37-25 2 8 10 8m-35-14-6 9-7 3"/>
      <path d="M144 92l9-2 7-7 10-3 7-8 5-1m6 4 9-9m3 12 6-4 8-2 10-11 8-2m-8 8-8 10m26-20 19 10 10 1 10 7 14 2" opacity=".64"/>
    </g>
    <g stroke="#707f6d" stroke-width=".6" opacity=".78">
      <path d="M35 90l7-7m4-4-3 6m8-13 4 6m-1-1 2 4m51-12 4-6m1 2 4-9m-2 12 3-5m14 0 4 4m20-11 4-7m-2 8 6-6m21-7 5-7m0 5 2-4m14 5 3 5m17 6 5-4m13 4 5 3m23 2 8 6"/>
      <path d="M7 112l7-2m47-5 10-3 5-4m13-3 4-2m68 0 6-3m20-9 5-2m53-15 5 2 6 1"/>
    </g>
  </g>
  ${pine(13, 95, .6)}${pine(21, 92, .42)}${pine(66, 78, .55)}
  ${pine(104, 79, .6)}${pine(111, 76, .43)}${pine(204, 63, .6)}${pine(271, 48, .55)}
  <g transform="translate(127 69)" stroke="#4f604f" fill="#88957c" stroke-linejoin="round">
    <path d="M-9 0v-9l2 1v8m13-1v-8l2-1v10M-4 0v-12h1v12m7 0v-12h1v12" stroke-width=".85"/>
    <path d="M-11-12l3 1 4-1 3-2h4l3 2 3 1 3-1-2 3H-9Zm3 5h15" stroke-width=".7"/>
  </g>
  ${hall(185,49,.75)}${hall(251,32,.86)}
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M25 106Q35 103 39 99T61 96Q76 96 81 90L96 83Q109 76 129 72Q138 70 139 67T154 67L163 65Q170 61 166 59T178 55L185 52Q192 49 201 52T218 47Q223 43 235 44T255 36" stroke="#f4ecd9" stroke-width="3.6" opacity=".9"/>
    <path d="M25 106Q35 103 39 99T61 96Q76 96 81 90L96 83Q109 76 129 72Q138 70 139 67T154 67L163 65Q170 61 166 59T178 55L185 52Q192 49 201 52T218 47Q223 43 235 44T255 36" stroke="#a44736" stroke-width="1.6" stroke-dasharray="3.3 2.6"/>
  </g>
  <g fill="#fcf4de" stroke="#9c4435" stroke-width="1.4">
    ${stops.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.7"/>`).join('')}
  </g>
  <g fill="#3e5142" font-size="10" font-family="'Kaiti SC', KaiTi, STKaiti, 'Songti SC', SimSun, serif" letter-spacing="1">
    <text x="13" y="123">天外村</text><text x="245" y="13">玉皇顶</text>
  </g></svg>`
}
