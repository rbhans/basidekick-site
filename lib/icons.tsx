"use client";

import { ReactNode } from "react";
import {
  Wrench,
  Book,
  Books,
  User,
  Desktop,
  WaveTriangle,
  Buildings,
  BookOpen,
  BookmarksSimple,
  Chats,
  ChatCircle,
  Kanban,
  Calculator,
  SignIn,
  UserPlus,
  FileMagnifyingGlass,
  TextAa,
  CheckCircle,
  FileText,
  Folder,
  Plugs,
  Cpu,
  Warning,
  Translate,
  QrCode,
  DeviceMobile,
  Scan,
  Note,
  Lock,
  Lifebuoy,
  Thermometer,
  Gauge,
  Fan,
  WarningCircle,
  UsersThree,
  Briefcase,
  Image,
  Question,
  Bell,
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
    case "ChatCircle":
      return <ChatCircle {...iconProps} />;
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
    case "Folder":
      return <Folder {...iconProps} />;
    case "Plugs":
      return <Plugs {...iconProps} />;
    case "Cpu":
      return <Cpu {...iconProps} />;
    case "Warning":
      return <Warning {...iconProps} />;
    case "Translate":
      return <Translate {...iconProps} />;
    case "QrCode":
      return <QrCode {...iconProps} />;
    case "DeviceMobile":
      return <DeviceMobile {...iconProps} />;
    case "Scan":
      return <Scan {...iconProps} />;
    case "Note":
      return <Note {...iconProps} />;
    case "Lock":
      return <Lock {...iconProps} />;
    case "Thermometer":
      return <Thermometer {...iconProps} />;
    case "Gauge":
      return <Gauge {...iconProps} />;
    case "Fan":
      return <Fan {...iconProps} />;
    case "WarningCircle":
      return <WarningCircle {...iconProps} />;
    case "Books":
      return <Books {...iconProps} />;
    case "Lifebuoy":
      return <Lifebuoy {...iconProps} />;
    case "UsersThree":
      return <UsersThree {...iconProps} />;
    case "Briefcase":
      return <Briefcase {...iconProps} />;
    case "Image":
      return <Image {...iconProps} />;
    case "Question":
      return <Question {...iconProps} />;
    case "Bell":
      return <Bell {...iconProps} />;
    default:
      return null;
  }
}
