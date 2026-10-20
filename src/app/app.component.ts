import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BUILD_COMMIT, buildLabel } from './build-commit';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  /** Which build this is: its commit, linked to GitHub, once deployed. */
  protected readonly build = buildLabel(inject(BUILD_COMMIT));
}
