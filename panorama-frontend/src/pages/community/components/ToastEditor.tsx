import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/ko-kr' // 'ko'/'ko-KR' 언어팩 등록 (side-effect import)
import Editor from '@toast-ui/editor'
import { useEffect, useId, useRef } from 'react'
import type { RefObject } from 'react'

/** addImageBlobHook 시그니처 (Toast UI Editor hooks.addImageBlobHook) */
export type ImageUploadHook = (
  blob: Blob | File,
  callback: (url: string, altText?: string) => void,
) => void

interface ToastEditorProps {
  /** 부모가 getHTML() 등을 호출할 수 있도록 에디터 인스턴스를 내보내는 ref */
  editorRef: RefObject<Editor | null>
  /** 수정 모드 초기 본문 (HTML) */
  initialHtml?: string
  placeholder?: string
  height?: string
  onImageUpload?: ImageUploadHook
}

/**
 * @toast-ui/editor 코어를 감싼 얇은 React 래퍼.
 *
 * 공식 @toast-ui/react-editor 는 unmount 시 인스턴스를 destroy 하지 않아
 * React 18+ StrictMode(마운트→언마운트→재마운트)에서 에디터 DOM 이 중복 생성되고,
 * 이전 인스턴스의 UI 마크업이 문서 내용으로 흡수되는 버그가 있다.
 * → 코어를 직접 생성하고 cleanup 에서 destroy 해 해결.
 *
 * ⚠️ 한글 IME 주의: 에디터의 `placeholder` 옵션은 쓰지 않는다.
 * 내장 플레이스홀더는 ProseMirror 위젯 데코레이션으로 빈 문단 "안에" 실제
 * <span class="placeholder"> DOM 을 삽입하는 구현이라, 첫 글자 조합(composition)이
 * 시작되는 순간 조합 중인 문단 내부에서 그 span 이 제거(DOM 변이)되고,
 * Chromium 이 조합을 중단시켜 첫 글자가 자모로 분리된다('앙'→'ㅇㅏㅇ').
 * → DOM 을 건드리지 않는 CSS ::before 의사요소 방식으로 대체 (ProseMirror 권장 기법).
 */
export default function ToastEditor({
  editorRef,
  initialHtml,
  placeholder = '내용을 입력하세요',
  height = '520px',
  onImageUpload,
}: ToastEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // 의사요소 CSS 를 이 인스턴스에만 스코프하기 위한 고유 클래스
  const scopeClass = `te-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`

  useEffect(() => {
    if (!rootRef.current) return

    const editor = new Editor({
      el: rootRef.current,
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      height,
      language: 'ko-KR',
      usageStatistics: false,
      ...(onImageUpload ? { hooks: { addImageBlobHook: onImageUpload } } : {}),
    })
    if (initialHtml) editor.setHTML(initialHtml)
    editorRef.current = editor

    return () => {
      editorRef.current = null
      editor.destroy()
    }
    // 생성 옵션은 마운트 시점 값으로 고정한다 (초기값 변경은 부모가 key 로 리마운트)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={scopeClass}>
      {/* 빈 문서(<p><br></p> 하나)일 때만 보이는 CSS 플레이스홀더 — DOM 변이가 없어 IME 조합을 깨지 않는다 */}
      <style>{`
        .${scopeClass} .toastui-editor-ww-container .ProseMirror > p:only-child:has(> br:only-child)::before {
          content: '${placeholder.replace(/'/g, "\\'")}';
          float: left;
          height: 0;
          color: #ccc;
          pointer-events: none;
        }
      `}</style>
      <div ref={rootRef} />
    </div>
  )
}
