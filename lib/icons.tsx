"use client";

import { ReactNode } from "react";
import {
  Wrench,
  Book,
  User,
  Desktop,
  WaveTriangle,
  Buildings,
  BookOpen,
  BookmarksSimple,
  Chats,
  Kanban,
  Calculator,
  SignIn,
  UserPlus,
  FileMagnifyingGlass,
  TextAa,
  CheckCircle,
  FileText,
  Plugs,
  Cpu,
  Warning,
} from "@phosphor-icons/react";
import { IconName } from "./constants";

// Map icon names to components with default size
export function getIcon(name: IconName | string, className = "size-4"): ReactNode {
  const iconProps = { className };

  switch (name) {
    case "Wrench":
      return <Wrench {...iconProps} />;
    case "Book":
      return <Book {...iconProps} />;
    case "User":
      return <User {...iconProps} />;
    case "Desktop":
      return <Desktop {...iconProps} />;
    case "WaveTriangle":
      return <WaveTriangle {...iconProps} />;
    case "Buildings":
      return <Buildings {...iconProps} />;
    case "BookOpen":
      return <BookOpen {...iconProps} />;
    case "BookmarksSimple":
      return <BookmarksSimple {...iconProps} />;
    case "Chats":
      return <Chats {...iconProps} />;
    case "Kanban":
      return <Kanban {...iconProps} />;
    case "Calculator":
      return <Calculator {...iconProps} />;
    case "SignIn":
      return <SignIn {...iconProps} />;
    case "UserPlus":
      return <UserPlus {...iconProps} />;
    case "FileMagnifyingGlass":
      return <FileMagnifyingGlass {...iconProps} />;
    case "TextAa":
      return <TextAa {...iconProps} />;
    case "CheckCircle":
      return <CheckCircle {...iconProps} weight="fill" />;
    case "FileText":
      return <FileText {...iconProps} />;
    case "Plugs":
      return <Plugs {...iconProps} />;
    case "Cpu":
      return <Cpu {...iconProps} />;
    case "Warning":
      return <Warning {...iconProps} />;
    default:
      return null;
  }
}
