"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BulletList } from "@tiptap/extension-list";
import { OrderedList } from "@tiptap/extension-list";

interface TiptapProps {
  content?: string;
  onChange?: (html: string) => void;
}

const Tiptap = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-3",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-3",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "bulletList", "orderedList"],
      }),
    ],
    content: content || "<p>Hello World! 🌎️</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-screen w-180 shadow-sm p-16 mx-auto rounded-lg focus:outline-none bg-white border border-gray-100 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-8 [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-gray-900 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_li]:mb-2 [&_li]:text-gray-700",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  return (
    <div className="">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;

