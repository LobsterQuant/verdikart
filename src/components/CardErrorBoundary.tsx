"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export default class CardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <p className="text-sm text-text-secondary">
            {this.props.fallbackTitle ?? "Kunne ikke laste data"} — prøv å laste siden på nytt.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
