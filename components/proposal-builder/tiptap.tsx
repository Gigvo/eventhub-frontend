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
}

const Tiptap = ({ content }: TiptapProps) => {
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
          "min-h-screen w-180 shadow-sm p-16 mx-auto rounded-lg focus:outline-none",
      },
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

