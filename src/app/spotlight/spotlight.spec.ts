import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Spotlight } from './spotlight';

describe('Spotlight', () => {
  let fixture: ComponentFixture<Spotlight>;
  let component: Spotlight;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spotlight],
    }).compileComponents();

    fixture = TestBed.createComponent(Spotlight);
    component = fixture.componentInstance;
    component.open();
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render a search input field', () => {
    const input = nativeEl.querySelector('.spotlight-input');
    expect(input).toBeTruthy();
    expect(input?.tagName.toLowerCase()).toBe('input');
  });

  it('should show the results panel only when there are results', () => {
    // Initially empty query — no results panel
    let panel = nativeEl.querySelector('.spotlight-results');
    expect(panel).toBeNull();

    // Type a query that produces results
    const input = nativeEl.querySelector('.spotlight-input') as HTMLInputElement;
    input.value = 'about';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    panel = nativeEl.querySelector('.spotlight-results');
    expect(panel).toBeTruthy();
  });

  it('should render results grouped by category with headers via @for', () => {
    const input = nativeEl.querySelector('.spotlight-input') as HTMLInputElement;
    input.value = 'about';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const headers = nativeEl.querySelectorAll('.spotlight-category-header');
    expect(headers.length).toBeGreaterThan(0);

    const items = nativeEl.querySelectorAll('.spotlight-result-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should show an empty state when no results match via @if', () => {
    const input = nativeEl.querySelector('.spotlight-input') as HTMLInputElement;
    input.value = 'zzzznonexistent';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const emptyState = nativeEl.querySelector('.spotlight-empty');
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('No results');
  });

  it('should emit resultSelected with the result action when a result is clicked', () => {
    const spy = vi.fn();
    component.resultSelected.subscribe(spy);

    const input = nativeEl.querySelector('.spotlight-input') as HTMLInputElement;
    input.value = 'about';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const firstItem = nativeEl.querySelector('.spotlight-result-item') as HTMLElement;
    firstItem.click();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBeTruthy();
  });

  it('should close the overlay when Escape is pressed', () => {
    component.open();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    const input = nativeEl.querySelector('.spotlight-input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });
});
