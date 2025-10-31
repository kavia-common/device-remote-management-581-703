import { renderHook, act, waitFor } from '@testing-library/react';
import useDebouncedValue, { useDebouncedCallback } from '../useDebouncedValue';

// Mock timers
jest.useFakeTimers();

describe('useDebouncedValue', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('should debounce value changes with default delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by 250ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial'); // Still initial

    // Fast-forward remaining time
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated'); // Now updated
  });

  test('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'change2' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'change3' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be initial as timer keeps resetting
    expect(result.current).toBe('initial');

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now should be the latest value
    expect(result.current).toBe('change3');
  });

  test('should handle custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  test('should support leading edge execution', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500, { leading: true, trailing: false }),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value - should update immediately on leading edge
    rerender({ value: 'updated' });
    expect(result.current).toBe('updated');

    // Should not update again after delay (trailing: false)
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  test('should support both leading and trailing', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500, { leading: true, trailing: true }),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // First change - leading edge
    rerender({ value: 'change1' });
    expect(result.current).toBe('change1');

    // Quick second change
    rerender({ value: 'change2' });
    expect(result.current).toBe('change1'); // Still change1

    // After delay - trailing edge
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('change2');
  });

  test('should not update if value does not change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'same' } }
    );

    const initialResult = result.current;

    // Re-render with same value
    rerender({ value: 'same' });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should still be the same reference
    expect(result.current).toBe(initialResult);
    expect(result.current).toBe('same');
  });

  test('should cleanup timeout on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    
    // Unmount before timeout completes
    unmount();

    // Timer should be cleared, no errors should occur
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });
});

describe('useDebouncedCallback', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should debounce callback execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call the debounced function
    act(() => {
      result.current('arg1');
    });

    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  test('should cancel previous calls on rapid invocations', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Multiple rapid calls
    act(() => {
      result.current('call1');
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current('call2');
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current('call3');
    });

    // Complete delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should only be called once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('call3');
  });

  test('should support leading edge execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => 
      useDebouncedCallback(callback, 500, { leading: true, trailing: false })
    );

    // First call - should execute immediately
    act(() => {
      result.current('arg1');
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');

    // Should not be called again after delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should update callback reference', () => {
    let callbackFn = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: callbackFn } }
    );

    // Call with first callback
    act(() => {
      result.current('test');
    });

    // Update callback
    const newCallback = jest.fn();
    callbackFn = newCallback;
    rerender({ cb: newCallback });

    // Complete delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // New callback should be called
    expect(newCallback).toHaveBeenCalledWith('test');
  });

  test('should cleanup on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('test');
    });

    // Unmount before timeout
    unmount();

    // No errors should occur
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(500);
      });
    }).not.toThrow();

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle multiple arguments', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1', 'arg2', { key: 'value' });
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });
});
