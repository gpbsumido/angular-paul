import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './desktop/desktop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Desktop],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-paul');
}
