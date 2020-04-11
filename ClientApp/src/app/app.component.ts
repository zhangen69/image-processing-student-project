import { environment } from './../environments/environment';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, from, Observable, asapScheduler } from 'rxjs';
import { retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-image-processing-app';
  url = null;
  image = null;
  @ViewChild('imageOutput') imageOutput: ElementRef;
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
  };
  apiUrl = `${environment.apiUrl}/api/image`;
  error = null;
  history = [];
  onLoading = false;

  constructor(private eleRef: ElementRef, private http: HttpClient) {}

  onFileChanged(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      const file = files[files.length - 1];
      reader.readAsDataURL(file);
      reader.onload = () => {
        // called once readAsDataURL is completed
        const action = {
          id: this.createRandomString(),
          name: 'Select File: ' + file.name,
          image: reader.result,
        };
        this.onAction(action);
        this.url = reader.result; // add source to image
      };
    }
  }

  selectTool(tool) {
    this.selectedTool = tool;
  }

  onStart(image) {
    const apiUrl = `${environment.apiUrl}/api/image/resize`;
    const observer = this.http.post(apiUrl, {
      image,
      options: { width: 100, height: 100 },
    });
    observer.subscribe({
      next: (res: any) => {
        this.url = res.image;
        console.log(res);
      },
    });
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
      color: ['background']
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
          alert('Contract\'s level value only valid for -1, 0, 1');
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
