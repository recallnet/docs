"use client";

import dynamic from "next/dynamic";
import { type ButtonHTMLAttributes, useState } from "react";

// lazy load the dialog
const Dialog = dynamic(() => import("./search"));

/**
 * The trigger component for AI search dialog.
 *
 * Use it like a normal button component.
 */
export function AISearchTrigger(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [open, setOpen] = useState<boolean>();

  return (
    <>
      <button {...props} onClick={() => setOpen(true)} />
      {open !== undefined ? <Dialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
