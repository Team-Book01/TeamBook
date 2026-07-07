import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 개발 중 /api 로 시작하는 요청을 스프링 부트(localhost:8080)로 전달해 CORS를 피한다.
      // 이 프록시는 개발 서버(npm run dev) 전용이며, 빌드 결과물에는 포함되지 않는다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 백엔드 컨트롤러가 /api 접두어 없이 매핑돼 있다면(예: @GetMapping("/users"))
        // 아래 rewrite 주석을 풀어 /api 를 벗겨서 전달한다.
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
