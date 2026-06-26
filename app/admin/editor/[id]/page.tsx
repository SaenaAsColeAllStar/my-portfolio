"use client";

import React, { use } from "react";
import EditorContainer from "../editor-container";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditorIdPage({ params }: PageProps) {
  const { id } = use(params);
  return <EditorContainer nodeId={id} />;
}
