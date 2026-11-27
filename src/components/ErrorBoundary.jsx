import { Component } from 'react'
// If the 3D hero fails (no WebGL, blocked download), show nothing there instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}
