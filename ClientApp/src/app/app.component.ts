import { environment } from './../environments/environment';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as Tiff from 'tiff.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'ng-image-processing-app';
  url = null;
  image = null;
  @ViewChild('drawCanvas') drawCanvas: ElementRef;
  observer;
  selectedTool = null;
  selectedHistoryItem = null;
  formData: any = {
    fontSize: 'FONT_SANS_8',
    fontColor: 'BLACK',
    positionX: 0,
    positionY: 0,
    width: 500,
    height: 500,
    level: 1,
    degree: 90,
    flipHorizontal: false,
    flipVertical: false,
    color: null,
    type: 'lowpass'
  };
  apiUrl = `${environment.apiUrl}/api/image`;
  error = null;
  history = [];
  onLoading = false;

  constructor(private eleRef: ElementRef, private http: HttpClient) {}
  ngAfterViewInit(): void {
    this.onInitDrawer();
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      const file = files[files.length - 1];
      if (file.type === 'image/tiff' || file.type === 'image/tif') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
      reader.onload = () => {
        let dataURL = reader.result;
        // convert tiff to data URL
        if (file.type === 'image/tiff' || file.type === 'image/tif') {
          const tiff = new Tiff({ buffer: dataURL });
          dataURL = tiff.toDataURL();
        }
        // called once readAsDataURL is completed
        const action = {
          id: this.createRandomString(),
          name: 'Select File: ' + file.name,
          image: dataURL,
        };
        this.onAction(action);
        this.url = dataURL; // add source to image
      };
    }
  }

  onInitDrawer() {
    const canvas = this.drawCanvas.nativeElement;
    if (!canvas) {
      return;
    }
    const mouseOnClicked$ = fromEvent(canvas, 'click');
    const mouseOnMoved$ = fromEvent(canvas, 'mousemove');

    let element: HTMLElement = null;
    const mouse = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
    };

    const setMousePosition = (e) => {
      const ev = e || window.event; // Moz || IE
      if (ev.pageX) {
        // Moz
        mouse.x = ev.pageX + window.pageXOffset;
        mouse.y = ev.pageY + window.pageYOffset;
      } else if (ev.clientX) {
        // IE
        mouse.x = ev.clientX + document.body.scrollLeft;
        mouse.y = ev.clientY + document.body.scrollTop;
      }
    };

    mouseOnClicked$.subscribe({
      next: (event: MouseEvent) => {
        if (element !== null) {
          if (this.formData.text && this.selectedTool === 'crop') {
            this.formData.height = element.offsetHeight;
            this.formData.width = element.offsetWidth;
          }
          element.remove();
          element = null;
          canvas.style.cursor = 'default';
          this.onAction({
            id: this.createRandomString(),
            name: `SET SIZE & POSITION: w=${this.formData.width}, h=${this.formData.height}, x=${this.formData.positionX}, y=${this.formData.positionY}`,
            image: this.url,
          });
          console.log('finished.');
        } else {
          console.log('start to draw.');
          this.formData.positionX = mouse.startX = event.offsetX;
          this.formData.positionY = mouse.startY = event.offsetY;
          element = document.createElement('div');
          element.className = 'rectangle';
          element.style.left = event.offsetX + 'px';
          element.style.top = event.offsetY + 'px';
          element.style.border = '1px solid #f00';
          element.style.position = 'absolute';
          if (this.formData.text && this.selectedTool === 'printText') {
            element.innerHTML = this.formData.text;
            element.style.fontSize = this.formData.fontSize.split('_')[2] + 'px';
          }
          canvas.appendChild(element);
          canvas.style.cursor = 'crosshair';
          console.log(
            `position: x=${element.style.left} y=${element.style.top}`
          );
        }
      },
    });

    mouseOnMoved$.subscribe({
      next: (event: MouseEvent) => {
        setMousePosition(event);
        if (element !== null) {
          const w = Math.abs(mouse.x - mouse.startX);
          const h = Math.abs(mouse.y - mouse.startY);
          element.style.width = w + 'px';
          element.style.height = h + 'px';
          element.style.left =
            mouse.x - mouse.startX < 0 ? mouse.x + 'px' : mouse.startX + 'px';
          element.style.top =
            mouse.y - mouse.startY < 0 ? mouse.y + 'px' : mouse.startY + 'px';
        }
      },
    });
  }

  selectTool(tool) {
    this.selectedTool = tool;
  }

  onRevertUrl(item) {
    this.url = item.image;
    this.selectedHistoryItem = item;
  }

  onAction(item) {
    const prevAction = this.selectedHistoryItem;
    const matchedItem = this.history.find((x) => x.id === prevAction?.id);

    if (matchedItem && prevAction) {
      const indexMatchedItem = this.history.findIndex(
        (x) => x.id === prevAction.id
      );
      this.history = this.history.slice(0, indexMatchedItem + 1);
    }
    console.log('adding action to history', item);
    this.selectedHistoryItem = item;
    this.history.push(item);
  }

  createRandomString() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  onSaveImage(image) {
    const img = image.replace('image/png', 'image/octet-stream');
    const a = document.createElement('A');
    a.setAttribute('href', img);
    a.setAttribute('download', 'my-image-processing-output.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  shouldShowOption(optionName, selectedTool) {
    console.log('checking option', optionName, selectedTool);
    const config = {
      level: ['blur', 'opacity', 'contrast', 'scale', 'posterize'],
      degree: ['rotate'],
      flip: ['flip'],
      size: ['resize'],
      printText: ['printText'],
      color: ['background'],
      sizeWithPosition: ['crop'],
      convolution: ['convolute'],
    };
    if (!config[optionName]) {
      return false;
    }
    return config[optionName].includes(selectedTool);
  }

  onSubmit(formData: any, type: string, url: string) {
    const historyItem = {
      id: this.createRandomString(),
      name: null,
      image: null,
    };
    let observable: Observable<any> = null;

    switch (type) {
      case 'resize':
        historyItem.name = `${type.toUpperCase()}: w=${formData.width}px, h=${
          formData.height
        }px`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { width: formData.width, height: formData.height },
        });
        break;
      case 'blur':
      case 'opacity':
      case 'contrast':
      case 'scale':
      case 'posterize':
        if (type === 'contrast') {
          alert("Contract's level value only valid for -1, 0, 1");
          return;
        } else if (type === 'blur' && !Number.isInteger(formData.level)) {
          alert("Blur's level must be integer");
          return;
        }
        historyItem.name = `${type.toUpperCase()}: level=${formData.level}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { level: formData.level },
        });
        break;
      case 'background':
        historyItem.name = `${type.toUpperCase()}: color=${formData.color}`;
        const isValid = /^[0-9A-F]{6}$/i.test(formData.color);
        if (!isValid) {
          alert('Please enter valid hex color code');
          return;
        }
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { color: formData.color },
        });
        break;
      case 'rotate':
        historyItem.name = `${type.toUpperCase()}: degree=${
          formData.degree
        } degree`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { degree: formData.degree },
        });
        break;
      case 'flip':
        historyItem.name = `${type.toUpperCase()}: horizontal=${
          formData.flipHorizontal ? 'Yes' : 'No'
        }, vertical=${formData.flipVertical ? 'Yes' : 'No'};`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: {
            flipHorizontal: formData.flipHorizontal,
            flipVertical: formData.flipVertical,
          },
        });
        break;
      case 'printText':
        historyItem.name = `${type.toUpperCase()}: size=${
          formData.fontSize
        }, text=${formData.text}, color=${formData.fontColor}, x=${
          formData.positionX
        }, y=${formData.positionY}`;
        const font = formData.fontSize + '_' + formData.fontColor;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: {
            font,
            text: formData.text,
            x: formData.positionX,
            y: formData.positionY,
          },
        });
        break;
      case 'crop':
        historyItem.name = `${type.toUpperCase()}: size=${
          formData.fontSize
        }, x=${formData.positionX}, y=${formData.positionY}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: {
            w: formData.width,
            h: formData.height,
            x: formData.positionX,
            y: formData.positionY,
          },
        });
        break;
      case 'convolute':
        historyItem.name = `${type.toUpperCase()}: type=${formData.type}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: { type: formData.type },
        });
        break;
      default:
        historyItem.name = `${type.toUpperCase()}`;
        observable = this.http.post(`${this.apiUrl}/${type}`, {
          image: url,
          options: null,
        });
        break;
    }

    this.onLoading = true;
    const subscription = observable.pipe(retry(3)).subscribe({
      next: (res: any) => {
        this.onLoading = false;
        historyItem.image = res.image;
        this.onAction(historyItem);
        this.url = res.image;
        if (this.error) {
          this.error = null;
        }
      },
      error: (err) => {
        this.onLoading = false;
        this.error = err;
        window.alert('Failed to process image');
        console.error('failed to process image', err);
      },
      complete: () => {
        subscription.unsubscribe();
      },
    });
  }
}
