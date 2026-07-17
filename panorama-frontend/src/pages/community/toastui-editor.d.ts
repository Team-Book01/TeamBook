/**
 * @toast-ui/editor 타입 셔임.
 * 패키지에 타입(types/index.d.ts)이 있지만 package.json "exports" 에 types 매핑이 빠져 있어
 * moduleResolution: bundler 환경에서 TS 가 찾지 못한다 → 실제 타입 파일로 연결해 준다.
 */
declare module '@toast-ui/editor' {
  import Editor from '@toast-ui/editor/types/index'

  export * from '@toast-ui/editor/types/index'
  export default Editor
}
