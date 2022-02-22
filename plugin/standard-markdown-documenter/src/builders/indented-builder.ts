import { StringBuilder } from '@microsoft/tsdoc';

export class IndentedWriter {
  private _latestChunk?: string;
  private _previousChunk?: string;
  private _atStartOfLine: boolean = true;
  private _indentStack: string[] = [];
  private _indentText: string = '';
  private _builder: StringBuilder;
  public defaultIndentPrefix: string = '  ';

  private _currentLineIsBlank: boolean;
  public trimLeadingSpaces: boolean = false;
  public constructor(stringBuilder: StringBuilder) {
    this._builder = stringBuilder;
    this._latestChunk = undefined;
    this._previousChunk = undefined;
    this._currentLineIsBlank = true;
  }

  public ensureSkippedLine(): void {
    if (this.peekLastCharacter() !== '\n') {
      this._writeNewLine();
    }

    const secondLastCharacter = this.peekSecondLastCharacter();
    if (secondLastCharacter !== '\n' && secondLastCharacter !== '') {
      this._writeNewLine();
    }
  }

  public ensureNewLine(): void {
    const lastCharacter = this.peekLastCharacter();
    if (lastCharacter !== '\n' && lastCharacter !== '') {
      this._writeNewLine();
    }
  }

  public increaseIndent(indentPrefix?: string): void {
    this._indentStack.push(indentPrefix !== undefined ? indentPrefix : this.defaultIndentPrefix);
    this._updateIndentText();
  }

  public decreaseIndent(): void {
    this._indentStack.pop();
    this._updateIndentText();
  }

  public peekSecondLastCharacter(): string {
    if (this._latestChunk !== undefined) {
      if (this._latestChunk.length > 1) {
        return this._latestChunk.substr(-2, 1);
      }
      if (this._previousChunk !== undefined) {
        return this._previousChunk.substr(-1, 1);
      }
    }
    return '';
  }

  public peekLastCharacter(): string {
    if (this._latestChunk !== undefined) {
      return this._latestChunk.substring(-1, 1);
    }
    return '';
  }

  public writeLine(message: string = ''): void {
    if (message.length > 0) {
      this.write(message);
    }
    this._writeNewLine();
  }

  public write(message: string): void {
    if (message.length === 0) {
      return;
    }

    // If there are no newline characters, then append the string verbatim
    if (!/[\r\n]/.test(message)) {
      this._writeLinePart(message);
      return;
    }

    // Otherwise split the lines and write each one individually
    let first = true;
    for (const linePart of message.split('\n')) {
      if (!first) {
        this._writeNewLine();
      } else {
        first = false;
      }
      if (linePart) {
        this._writeLinePart(linePart.replace(/[\r]/g, ''));
      }
    }
  }

  private _updateIndentText(): void {
    this._indentText = this._indentStack.join('');
  }

  private _writeLinePart(message: string): void {
    let trimmedMessage = message;

    if (this.trimLeadingSpaces && this._atStartOfLine) {
      trimmedMessage = message.replace(/^ +/, '');
    }

    if (trimmedMessage.length > 0) {
      if (this._atStartOfLine && this._indentText.length > 0) {
        this._write(this._indentText);
      }
      this._write(trimmedMessage);
      if (this._currentLineIsBlank) {
        if (/\S/.test(trimmedMessage)) {
          this._currentLineIsBlank = false;
        }
      }
      this._atStartOfLine = false;
    }
  }

  public getText(): string {
    return this._builder.toString();
  }

  public toString(): string {
    return this.getText();
  }

  private _writeNewLine(): void {
    if (this._atStartOfLine && this._indentText.length > 0) {
      this._write(this._indentText);
    }
    this._write('\n');
    this._atStartOfLine = true;
  }

  private _write(str: string): void {
    this._previousChunk = this._latestChunk;
    this._latestChunk = str;
    this._builder.append(str);
  }
}
