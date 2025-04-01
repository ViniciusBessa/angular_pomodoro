import { Component, inject } from '@angular/core';
import { ConfigurationsService } from '../../services/configurations.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  // Injecting the ConfigurationsService to manage app settings
  configurationsService = inject(ConfigurationsService);

  // Signal to track the current theme (light or dark)
  theme = toSignal(this.configurationsService.themeSubject);

  // State variable to toggle the visibility of the settings panel
  showConfigs = false;

  // Toggles the visibility of the settings panel
  OnToggleConfigs(): void {
    this.showConfigs = !this.showConfigs;
  }

  // Changes the theme by calling the ConfigurationsService
  OnChangeTheme(): void {
    this.configurationsService.changeTheme();
  }
}
