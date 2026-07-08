import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class Window {
  readonly title = input('Untitled');
  readonly icon = input('');
  readonly width = input(640);
  readonly height = input(480);
  readonly x = input(100);
  readonly y = input(100);
  readonly isActive = input(false);

  readonly closed = output<void>();
  readonly minimized = output<void>();
  readonly maximized = output<void>();
}
