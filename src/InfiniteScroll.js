import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class InfiniteScroll extends Component {
    static propTypes = {
        element: PropTypes.string,
        hasMore: PropTypes.bool,
        initialLoad: PropTypes.bool,
        loadMore: PropTypes.func.isRequired,
        pageStart: PropTypes.number,
        threshold: PropTypes.number,
        useWindow: PropTypes.bool,
        scrollable: PropTypes.string,
    };

    static defaultProps = {
        element: 'div',
        hasMore: false,
        initialLoad: true,
        pageStart: 0,
        threshold: 250,
        useWindow: true
    };

    constructor(props) {
        super(props);

        this.scrollListener = this.scrollListener.bind(this);
    }

    componentDidMount() {
        this.pageLoaded = this.props.pageStart;
        this.attachScrollListener();
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    render() {
        const {
            children,
            element,
            hasMore,
            initialLoad,
            loader,
            loadMore,
            pageStart,
            threshold,
            useWindow,
            scrollable,
            ...props
        } = this.props;

        return React.createElement(element, props, children, hasMore && (loader || this._defaultLoader));
    }

    getScrollEl() {
      if (this.props.useWindow) return window
      if (this.props.scrollable != null) return document.querySelector(this.props.scrollable)
      return ReactDOM.findDOMNode(this).parentNode
    }

    calculateTopPosition(el) {
        if(!el) {
            return 0;
        }
        return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }

    scrollListener() {
        const el = ReactDOM.findDOMNode(this);
        const scrollEl = window;

        let offset;
        if(this.props.useWindow) {
            var scrollTop = (scrollEl.pageYOffset !== undefined) ? scrollEl.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            offset = this.calculateTopPosition(el) + el.offsetHeight - scrollTop - window.innerHeight;
        } else {
            const parentEl = this.getScrollEl()
            offset = el.scrollHeight - parentEl.scrollTop - parentEl.clientHeight;
        }

        if(offset < Number(this.props.threshold)) {
            this.detachScrollListener();
            // Call loadMore after detachScrollListener to allow for non-async loadMore functions
            if(typeof this.props.loadMore == 'function') {
                this.props.loadMore(this.pageLoaded += 1);
            }
        }
    }

    attachScrollListener() {
        if(!this.props.hasMore) {
            return;
        }

        const scrollEl = this.getScrollEl()

        scrollEl.addEventListener('scroll', this.scrollListener);
        scrollEl.addEventListener('resize', this.scrollListener);

        if(this.props.initialLoad) {
            this.scrollListener();
        }
    }

    detachScrollListener() {
        const scrollEl = this.getScrollEl()

        scrollEl.removeEventListener('scroll', this.scrollListener);
        scrollEl.removeEventListener('resize', this.scrollListener);
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    // Set a defaut loader for all your `InfiniteScroll` components
    setDefaultLoader(loader) {
        this._defaultLoader = loader;
    }
}
