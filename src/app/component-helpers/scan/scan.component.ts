import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Nip46Uri } from '@iijat-sw/nip46';
import {
  NgxScannerQrcodeComponent,
  ScannerQRCodeResult,
} from 'ngx-scanner-qrcode';

const LOCAL_STORAGE = {
  CAMERA: 'cameraDeviceId',
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'delmo-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent implements AfterViewInit {
  @Input() show = false;
  @Output() showChange = new EventEmitter<boolean>();
  @Output() newApp = new EventEmitter<Nip46Uri>();

  @ViewChild('scanner') scanner: NgxScannerQrcodeComponent | undefined;

  get selectedDevice(): InputDeviceInfo | undefined {
    return this._selectedDevice;
  }
  set selectedDevice(device: InputDeviceInfo | undefined) {
    this._selectedDevice = device;

    if (device) {
      localStorage.setItem(LOCAL_STORAGE.CAMERA, device.deviceId);
      this.scanner?.playDevice(device.deviceId);
    }
  }

  devices: InputDeviceInfo[] = [];

  // #region Private Properties

  private _selectedDevice: InputDeviceInfo | undefined;

  // #endregion Private Properties

  ngAfterViewInit(): void {
    this.scanner?.start((devices: InputDeviceInfo[]) => {
      this.devices = devices;
      if (this.scanner) {
        this.scanner.isBeep = false;
      }
      this.selectedDevice = this.devices.find(
        (x) => x.deviceId === localStorage.getItem(LOCAL_STORAGE.CAMERA)
      );
    });
  }

  // #region Public Methods

  onEvent(event: ScannerQRCodeResult[]) {
    this._checkScannedCode(event[0].value);
  }

  onClickClose() {
    this.scanner?.stop();
    this.showChange.emit(false);
  }

  // #endregion Public Methods

  // #region Private Methods

  private _checkScannedCode(text: string) {
    try {
      const app = Nip46Uri.fromURI(text);
      this.newApp.emit(app);
      this.showChange.emit(false);
    } catch (error) {
      // Do nothing.
    }
  }

  // #endregion Private Methods
}
