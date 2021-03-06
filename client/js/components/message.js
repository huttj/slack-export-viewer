import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {colors} from '../constants';
import Store from '../store';

@observer
export default class Message extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  toggleImage(e, url) {
    e.stopPropagation();
    this.setState({ [url]: !this.state[url] });
  }

  select() {
    Store.selectedMessage = this.props.message;
    Store.loadMessage(this.props.channel, this.props.message);
  }

  selectUser(e, user) {
    if (user) {
      Store.selectedMessage = this.props.message;
      Store.loadUser(user);
    }
    e.stopPropagation();
  }

  componentDidMount() {
    if (Store.isSelectedMessage(this.props.message) || Store.isGoToMessage(this.props.message)) {
      setTimeout(() => {
        this.refs.self && this.refs.self.scrollIntoView()
      });
    }
  }

  componentDidUpdate() {
    if (Store.isSelectedMessage(this.props.message) || Store.isGoToMessage(this.props.message)) {
      setTimeout(() => {
        this.refs.self && this.refs.self.scrollIntoView()
      });
    }
  }

  render() {

    const {i} = this.props;
    const { user, text, ts, username, icons, channel, file, attachments } = this.props.message;

    const User = Store.findUser(user);

    let iconSrc;
    let name;

    if (User) {
      name = User.name;
      iconSrc = User.profile.image_32;
    } else {
      name = username;
      iconSrc = icons ? icons.image_48 : 'http://speedsf.com/instructors/default_profile.jpg';
    }

    let backgroundColor = i % 2 === 0 ? colors.primarySuperLight : colors.icon;

    if (Store.isSelectedMessage(this.props.message)) {
      backgroundColor = colors.accent;
    }

    let channelName = null;
    if (channel && this.props.type === 'user') {
      channelName = <span> in <a href={'#' + channel} onClick={e => this.select(e)}>{channel}</a></span>
    }

    let image = null;
    if (file && file.mimetype.match('image')) {
      image = <img onClick={e=>this.toggleImage(e, file.url_private)} style={{ marginTop: 6, maxWidth: this.state[file.url_private] ? '100%' : '25%' }} src={file.url_private} alt={file.title || file.name} />
    }

    let attache;
    if (attachments) {
      attache = attachments.reduce((list, { image_url }) => {

        if (image_url) {
          list.push(<img key={image_url} onClick={e=>this.toggleImage(e, image_url)} style={{ marginTop: 6, maxWidth: this.state[image_url] ? '100%' : '25%' }} src={image_url} alt={image_url} />);
        }

        return list;
      }, []);
    }

    return (
      <div style={{backgroundColor, padding: 8, paddingBottom: 9 }} onClick={() => this.select()} ref="self" key={ user + ':' + text + ':' + ts }>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <img style={{
            flex: '0 0 32',
            width: 32,
            height: 32,
            marginTop: 6,
            marginRight: 6,
            marginLeft: 2,
            borderRadius: 100
          }} src={iconSrc} alt="" onClick={e => this.selectUser(e, User)}/>
          <div style={{flex: 1}}>
            <p style={{margin: 2, }}><strong onClick={e => this.selectUser(e, User)}>{name}</strong>{channelName}</p>
            <p style={{margin: 2, fontSize: 14, color: colors.textLight}}> {new Date(ts * 1000).toLocaleString()}</p>
            <div style={{
              margin: 2,
              marginTop: 6,
              wordBreak: 'break-word',
              lineHeight: 1.33,
              color: colors.text
            }}>
              {messageText(text)}
            </div>
            {image}
            {attache}
          </div>
        </div>

      </div>
    );
  }
}

function messageText(text = '') {

  const REPLACEMENT = '~~~REPLACEMENT~~~';

  const result = [];

  let i = 0;

  return text
    .replace(/<([^>]+)>|(\*[^*]+\*)|(_[^_]+_)|(?:\n?&gt;\s*[^\n]+($|\n)+)|\n|(```[^`]+```)/g, function (match, capture) {

      const str = (capture || match);



      switch (str[0]) {
        case '@':
          const username = str.slice(1).split('|')[0];
          const user = Store.findUser(username);
          result.push(<a key={i++} href={'#' + user.name} onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            Store.loadUser(user);
          }}>{highlight('@' + user.name)}</a>);
          break;
        case '_':
          result.push(<em key={i++}>{highlight(str.slice(1, -1))}</em>);
          break;
        case '*':
          result.push(<em key={i++}>{highlight(str.slice(1, -1))}</em>);
          break;

        case '&':
        case '\n':

          const quote = str.match(/\n?\s*&gt;\s*([^\n]+)/);

          if (quote) {
            result.push(<p style={{ borderLeft: '4px solid rgba(0,0,0,.2)', paddingLeft: 8 }}>{highlight(quote[1].trim())}</p>)
          } else {

            result.push(<br key={i++} />);
          }
          break;
        case '`':
          result.push(<pre key={i++} style={{width: '100%', overflow: 'auto'}}>{highlight(str.slice(3, -3))}</pre>);
          break;

        case '#':
          const channel = Store.findChannel(str.slice(1).split('|')[0]);

          if (!channel) {
            result.push(<span key={i++} style={{ color: colors.textLight }}>[deleted]</span>);
            break;
          }
          result.push(<a key={i++} href={str} onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            Store.loadChannel(channel);
          }}>{highlight('#' + channel.name)}</a>);
          break;

        case 'h':

          const match = str.match(/https\:\/\/[^.]+\.slack\.com\/archives\/([^/]+)\/p(\d+)/);

          if (match) {
            const [_, channelName, ts] = match;
            const chn = Store.findChannel(channelName);
            const realChannelName = chn ? chn.name : channelName;

            result.push(<a key={i++} href={'#' + str} onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              Store.selectedMessage = { user: undefined, ts: ts/1000000 };
              Store.loadMessage(realChannelName, Store.selectedMessage);
            }}>{highlight('#' + realChannelName)}</a>);
            break;
          }

        default:
          const [link, name] = str.split('|');
          result.push(<a key={i++} href={link} target="_blank" rel="noopener"
                         onClick={e => e.stopPropagation()}>{highlight(name || link)}</a>);
      }

      return REPLACEMENT;

    })
    .split(REPLACEMENT)
    .reduce((acc, n, i) => acc.concat(highlight(n), result[i]), []);

}

function highlight(text) {

  const REPLACEMENT = '~~~REPLACEMENT~~~';
  const result = [];

  let parsed = text
    .replace(/&(\w+);/g, function (match, capture) {
      switch (capture) {
        case 'gt':
          return '>';
        case 'lt':
          return '<';
        case 'amp':
          return '&';
        default:
          return match;
      }
    });

  if (Store.searchTerm) {
    parsed = parsed.replace(new RegExp(Store.searchTerm, 'gi'), function (match, capture) {
      result.push(<span style={{backgroundColor: colors.accent}}>{match}</span>);
      return REPLACEMENT;
    })
  }

  return parsed.split(REPLACEMENT)
    .reduce((acc, n, i) => acc.concat(n, result[i]), []);
}