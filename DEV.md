# Server -> player
## 1. start 
`{
  type: "start",
  players: [
        {
            user_id
            index
        }..
        {
    }
  ]
}
`
## 2. state
{
  type: "state",
  time: ..
  status: waiting/live/stop
  players: [
        {
            user_id
            pos: []
            rockets: [],
            heath
            score
        }..
        {
    }
  ]
}

## 3. stop
{
  type: "stop",

  players: [
        {
            user_id
            result:  "you win"

        }..
        {
    }
  ]
}



# Player -> server

## 1. state

{
  type: "state",
  state: {
    pos: []
    rockets: []
  }
}

## 2. shot

`{
  type: "shot",
  shot_id: id
}

`<!-- 2. fall

{
  type: "fall",
  fall_id: id

} -->