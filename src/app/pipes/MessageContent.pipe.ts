import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'messageContent'
})
export class MessageContentPipe implements PipeTransform {

    defaultRegex: RegExp = this.buildBbCodeRegex();
    boldRegex: RegExp = this.buildBbCodeRegex('b');
    italicRegex: RegExp = this.buildBbCodeRegex('i');
    underlinedRegex: RegExp = this.buildBbCodeRegex('u');

    transform(messageContent: string): string {
        let splittedMessage = messageContent.split(this.defaultRegex);

        if (splittedMessage.length > 1) {
            splittedMessage = splittedMessage.map(part => {
                if (part.match(this.boldRegex)) {
                    const tag = part.includes('/') ? '</b>' : '<b>';
                    return tag;
                } else if (part.match(this.italicRegex)) {
                    const tag = part.includes('/') ? '</i>' : '<i>';
                    return tag;
                } else if (part.match(this.underlinedRegex)) {
                    const tag = part.includes('/') ? '</u>' : '<u>';
                    return tag;
                } else {
                    return part;
                }
            });
            return splittedMessage.join('');
        } else {
            return messageContent;
        }
    }

    buildBbCodeRegex(type: string = '.'): RegExp {
        return new RegExp(`(\\[\\/?${type}{1}\\])`, 'gi');
    }

}
