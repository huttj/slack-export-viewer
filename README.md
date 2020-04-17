# Slack Export Viewer

*Browse and search slack export archives in the browser.* 

![Preview](preview.png)


## Explanation

This simple app provides a limited API for querying the JSON output of Slack exports, as well as a React.js-based web
interface for consuming the API.


## Instructions

1. Install the dependencies.  
    `npm i` 
    
2. [Generate a Slack export](https://slack.com/help/articles/201658943-Export-your-workspace-data) and unzip the contents 
to the `slack_export` directory.

3. Run the app.  
    `npm start`
    
4. Open `localhost:3000` in your browser.


## Future Improvements

#### Standardize API

I created the initial API based on what I thought I needed on the client side, and I added to it as I built the app. As
a result, the responses are inconsistent, and where the app gets some data (like message counts) is quite unreliable and
messy. It would be best to standardize the API so that it would return the messages in question, metadata like counts
and next and previous messages, and so on.

#### Leverage Proper Indexes

There is no database or indexing; it merely loads and filters the JSON in memory. This could be ameliorated by either:
- Creating a backing store, with appropriate indexes, and loading the data through a separate script.
- Using an in-memory index.

Perhaps in the longer term, a database that supports full-text search could be added. 

#### Client-side Routing

It would be nice for each event to generate a history stack and appropriate hash change, so that states could be linked
via URL, and so the user can go back to previous states/pages.

#### Word Cloud

It would be fun to add a word cloud, globally, per user, and per channel, to see what the most commonly used words are.

#### Stats

It would be cool to have stats on some of the following (on global, per channel, and per user):
 - Count of messages by time of day, day of week, and month of year
 - Sentiment analysis
 - Average message length
 - Keyword/topic modeling -- where has a keyword or topic appeared, and with what frequency (e.g., histogram of topic
 density per channel or user, over time)


## License

The MIT License (MIT)

Copyright (c) 2017 Joshua Hutt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.