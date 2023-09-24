//function parseDiscordMarkdown(input) {
//    const italicRegex = /\*(.*?)\*/g;

//    const finalRequests = [];
//    let currIndex = 1; // Start at 1 since 0 is reserved for document structure
//    let lastMatchEnd = 0;
//    let match;

//    while ((match = italicRegex.exec(input)) !== null) {
//        const beforeMatch = input.slice(lastMatchEnd, match.index);
//        const matchedValue = match[1]; // The actual value inside the asterisks

//        if (beforeMatch) {
//            finalRequests.push({
//                insertText: {
//                    location: {
//                        index: currIndex
//                    },
//                    text: beforeMatch
//                }
//            });
//            currIndex += beforeMatch.length;
//        }

//        finalRequests.push({
//            insertText: {
//                location: {
//                    index: currIndex
//                },
//                text: matchedValue
//            }
//        });

//        finalRequests.push({
//            updateTextStyle: {
//                range: {
//                    startIndex: currIndex,
//                    endIndex: currIndex + matchedValue.length
//                },
//                textStyle: {
//                    italic: true
//                },
//                fields: 'italic'
//            }
//        });

//        currIndex += matchedValue.length;
//        lastMatchEnd = match.index + matchedValue.length + 2;
//        italicRegex.lastIndex = 0; // Reset the regex lastIndex
//    }

//    const afterLastMatch = input.slice(lastMatchEnd);
//    if (afterLastMatch) {
//        finalRequests.push({
//            insertText: {
//                location: {
//                    index: currIndex
//                },
//                text: afterLastMatch
//            }
//        });
//    }

//    return finalRequests;
//}

//module.exports.parseDiscordMarkdown = parseDiscordMarkdown;
