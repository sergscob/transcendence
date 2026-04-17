# Server -> player
## 1. start 
```
{
    type: "start",
    players: [
        {
            user_id:
            index:
        }..
    ]
}
```

## 2. state
```
{
    type: "state",
    time: ..
    status: waiting/live/stop
    max_players: 
    online_players:
    live_players:
    players: [
        {
            user_id
            pos: []
            rockets: [],
            health:
            score:
        }..
  ]
}
```

## 3. stop
```
{
    type: "stop",
    players: [
        {
            user_id
            result:  "you win"
        }..
  ]
}
```

# Player -> server

## 1. state

```
{
    type: "state",
    user_id: id,
    state: 
	{
        pos: []
		rotation: []
        rockets: []
    }
}
```


## 2. shot

```
{
    type: "shot",
    user_id: id,
    shot_id: id
    damage:  // default 10
    score:   // default 10 
}
```



