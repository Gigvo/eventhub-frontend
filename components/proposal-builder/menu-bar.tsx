import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignStart,
  Underline,
} from "lucide-react";
import React from "react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const Options = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      action: () => {
        if (editor.isActive("heading", { level: 1 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level: 1 }).run();
        }
      },
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      action: () => {
        if (editor.isActive("heading", { level: 2 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level: 2 }).run();
        }
      },
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      action: () => {
        if (editor.isActive("heading", { level: 3 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level: 3 }).run();
        }
      },
      isActive: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <Underline className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      icon: <TextAlignStart className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <TextAlignCenter className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <TextAlignJustify className="h-4 w-4" />,
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      isActive: editor.isActive({ textAlign: "justify" }),
    },
    {
      icon: <List className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ];

  return (
    <div className="border border-gray-200 rounded-lg mb-6 flex flex-wrap items-center gap-1 sm:gap-2 p-1 justify-center max-w-full w-fit mx-auto bg-gray-50/50 shadow-sm">
      {Options.map((option, index) => (
        <Toggle
          key={index}
          onClick={option.action}
          className="p-1.5 sm:p-2 rounded-md aria-pressed:bg-transparent data-[state=on]:bg-transparent hover:bg-gray-100 transition-colors"
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
