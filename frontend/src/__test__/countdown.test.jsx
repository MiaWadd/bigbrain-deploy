import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CountdownTimer from "../components/QuestionCountdown";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders the countdown and decreases over time", () => {
    const futureTime = new Date(Date.now() + 5000);
    render(<CountdownTimer endTime={futureTime} onExpire={vi.fn()} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/4/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/3/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/2/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it("calls onExpire when timer hits 0", () => {
    const onExpire = vi.fn();
    const futureTime = new Date(Date.now() + 2000);
    render(<CountdownTimer endTime={futureTime} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledOnce();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("calls onExpire if timer starts on 0", () => {
    const onExpire = vi.fn();
    const futureTime = new Date(Date.now());
    render(<CountdownTimer endTime={futureTime} onExpire={onExpire} />);
    expect(onExpire).toHaveBeenCalledOnce();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("Countdown is red when seconds are 3 or less", () => {
    const onExpire = vi.fn();
    const futureTime = new Date(Date.now() + 3000);
    render(<CountdownTimer endTime={futureTime} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const redText = screen.getByText(/2/);
    expect(redText).toHaveClass("text-red-600");
  });

  it("resets when endTime changes", () => {
    const onExpire = vi.fn();
    const initialTime = new Date(Date.now() + 5000);
    const { rerender } = render(<CountdownTimer endTime={initialTime} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/2/)).toBeInTheDocument();
    const newEndTime = new Date(Date.now() + 10000);
    rerender(<CountdownTimer endTime={newEndTime} onExpire={onExpire} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });
});
