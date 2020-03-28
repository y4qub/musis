import React from 'react'
import { Text, Image } from 'react-native'
import { ISpotifySong } from '../interfaces/song'

interface IProps {
    song?: ISpotifySong
}

interface IState { }

export class Song extends React.Component<IProps, IState> {
    d
    p
    t

    constructor(props: IProps) {
        super(props)
        if(!this.props.song) return
        const minutes = parseInt((props.song.duration / 60000).toString())
        const seconds = parseInt(((props.song.duration / 60000 - minutes) * 60).toString())
        this.d = `${minutes}:${seconds}`
        this.p = `${parseInt((props.song.progress / 60000).toString())}:${(props.song.progress / 60000 - parseInt((props.song.progress / 60000).toString())) * 60}`
        this.t = `${parseInt((props.song.timestamp / 60000).toString())}:${(props.song.timestamp / 60000 - parseInt((props.song.timestamp / 60000).toString())) * 60}`
    }

    render() {
        return (
            this.props.song ?
                <>
                    <Image source={{ uri: this.props.song.coverUrl, width: 180, height: 180 }} />
                    <Text>{this.props.song.name}</Text>
                    <Text>d {this.d}</Text>
                    <Text>p {this.p}</Text>
                    <Text>t {this.t}</Text>
                </> : <Text>None</Text>
        )
    }

}