import '@toast-ui/editor/dist/toastui-editor.css'
import Editor from '@toast-ui/editor'
import { useEffect, useRef } from 'react'
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
 */
export default function ToastEditor({
  editorRef,
  initialHtml,
  placeholder = '내용을 입력하세요',
  height = '520px',
  onImageUpload,
}: ToastEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return

    const editor = new Editor({
      el: rootRef.current,
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      height,
      placeholder,
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

  return <div ref={rootRef} />
}
