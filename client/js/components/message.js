import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {colors} from '../constants';
import Store from '../store';

@observer
export default class Message extends Component {

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
        console.log('Scrolling to message');
        this.refs.self && this.refs.self.scrollIntoView()
      });
    }
  }

  componentDidUpdate() {
    if (Store.isSelectedMessage(this.props.message) || Store.isGoToMessage(this.props.message)) {
      setTimeout(() => {
        console.log('Scrolling to message');
        this.refs.self && this.refs.self.scrollIntoView()
      });
    }
  }

  render() {

    const {i} = this.props;
    const { user, text, ts, username, icons } = this.props.message;

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

    return (
      <div style={{backgroundColor, padding: 8, paddingBottom: 9}} onClick={() => this.select()} ref="self" key={ user + ':' + text + ':' + ts }>
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
            <p style={{margin: 2, fontWeight: 'bold'}} onClick={e => this.selectUser(e, User)}>{name}</p>
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
          </div>
        </div>

      </div>
    );
  }
}

function messageText(text = '') {

  const REPLACEMENT = '~~~REPLACEMENT~~~';

  const result = [];

  return text
    .replace(/<([^>]+)>|(\*[^*]+\*)|(_[^_]+_)|\n|(```[^`]+```)/g, function (match, capture) {

      const str = (capture || match);

      switch (str[0]) {
        case '@':
          const username = str.slice(1).split('|')[0];
          const user = Store.findUser(username);
          result.push(<a href={'#' + user.name} onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            Store.loadUser(user);
          }}>{highlight('@' + user.name)}</a>);
          break;
        case '_':
          result.push(<em>{highlight(str.slice(1, -1))}</em>);
          break;
        case '*':
          result.push(<em>{highlight(str.slice(1, -1))}</em>);
          break;
        case '\n':
          result.push(<br/>);
          break;
        case '`':
          result.push(<pre style={{width: '100%', overflow: 'auto'}}>{highlight(str.slice(3, -3))}</pre>);
          break;
        case '#':
          const channel = Store.findChannel(str.slice(1).split('|')[0]);
          if (!channel) {
            result.push(<span style={{ color: colors.textLight }}>[deleted]</span>);
            break;
          }
          result.push(<a href={str} onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            Store.loadChannel(channel);
          }}>{highlight('#' + channel.name)}</a>);
          break;
        default:
          const [link, name] = str.split('|');
          result.push(<a href={link} target="_blank" rel="noopener"
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