import React from 'react';
import axios from 'axios';
import { ROOT_URL } from '../../config';
import { withRouter } from 'react-router';
import { Card, CardImg, CardDeck } from 'reactstrap';
import './OutfitEdit.css';
import '../Landing_Page/Modal.css';

class OutfitEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            outfit: '',
            name: '',
            lastWorn: Date,
            worn: Date,
            top: '',
            bottom: '',
            shoes: '',
            oldID: '',
            itemSelection: [],
            editItem: false,
        }
    }

    componentDidMount() {
        this.setAuthToken();
        this.getOutfit();
    }

    setAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common.Authorization = token;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }
    }

    getOutfit = () => {
        const user = this.props.getUserID();
        const outfitId = this.props.location.pathname.split('Edit/')[1];
        axios.get(`${ROOT_URL.API}/outfits/${user}/${outfitId}`)
            .then(response => {
                const { data } = response;
                let lastWorn = data.worn[0];
                if (lastWorn) {
                    lastWorn = lastWorn.split('T')[0];
                }
                this.setState({ outfit: data, name: data.name, worn: data.worn, lastWorn, user })
            })
            .catch(err => {
                console.log(err);
            })
    }

    populate = id => {
        const { user } = this.state;
        axios.get(`${ROOT_URL.API}/items/${user}/${id}`)
            .then(response => {
                this.setState({ [response.data.type]: response.data })
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleInput = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    redirectArchive = () => {
        this.props.history.push('/Archive');
    }

    submitChanges = () => {
        const { user, name, worn, lastWorn, top, bottom, shoes } = this.state;
        const outfitId = this.props.location.pathname.split('Edit/')[1];
        if (lastWorn) worn.unshift(lastWorn);
        const newInfo = { name, worn, top, bottom, shoes };
        axios.put(`${ROOT_URL.API}/outfits/${user}/${outfitId}`, newInfo)
            .then()
            .catch(err => {
                console.log(err);
            });
        this.redirectArchive();
    }

    getItems = (type, id) => {
        const { user } = this.state;
        axios.get(`${ROOT_URL.API}/items/type/${user}/${type}`)
            .then(response => {
                this.setState({ itemSelection: response.data, editItem: !this.state.editItem, oldID: id });
            })
            .catch(err => {
                console.log(err);
            });
    }

    selectItem = (type, id) => {
        const { outfit, oldID } = this.state;
        let index;
        if (type === "top" || type === "bottom") {
            outfit[type].forEach((itemID, i) => {
                if (itemID === oldID) index = i;
            })
            outfit[type][index] = id;
        } else {
            outfit[type] = id;
        }
        this.setState({ outfit, [type]: '' });
    }

    toggle = () => {
        this.setState({ editItem: !this.state.editItem });
    }

    render() {
        const { outfit, top, bottom, shoes, editItem, itemSelection } = this.state;
        const sources = [];
        if (outfit) {
            sources.push(...outfit.top, ...outfit.bottom, outfit.shoes);
        }
        if (!top || !bottom || !shoes) {
            sources.forEach((id) => this.populate(id));
        }
        const items = [top, bottom, shoes];
        return (
            <div>
                {editItem ?
                    <div className='modal--backdrop' onClick={this.toggle}>
                    </div> : null}
                {editItem ?
                    <div onClick={this.toggle}>
                        <div className="createContainer">
                            <CardDeck>
                                {itemSelection.map((item, index) => {
                                    return (<Card className='outfit--card' key={index} inverse>
                                        <CardImg
                                            key={item._id}
                                            width="80%"
                                            src={item.image}
                                            onClick={() => this.selectItem(item.type, item._id)}
                                            alt="Card image cap"
                                        />
                                    </Card>)
                                })}
                            </CardDeck>
                        </div>
                    </div>
                    :
                    <div>
                        {outfit ? (
                            <div className="createContainer">
                                <CardDeck>
                                    {items.map((item, index) => {
                                        return (<Card className='outfit--card' key={index} inverse>
                                            <CardImg
                                                key={item._id}
                                                width="80%"
                                                src={item.image}
                                                onClick={() => this.getItems(item.type, item._id)}
                                                alt="Card image cap"
                                            />
                                        </Card>)
                                    })}
                                    {/* <Card className='outfit--card' inverse>
                                        <CardImg
                                            width="80%"
                                            src={top.image}
                                            onClick={() => this.getItems(top.type)}
                                            alt="Card image cap"
                                        />
                                    </Card>
                                    <Card className='outfit--card' inverse>
                                        <CardImg
                                            width="80%"
                                            src={bottom.image}
                                            onClick={() => this.getItems(bottom.type)}
                                            alt="Card image cap"
                                        />
                                    </Card>
                                    <Card className='outfit--card' inverse>
                                        <CardImg
                                            width="80%"
                                            src={shoes.image}
                                            onClick={() => this.getItems(shoes.type)}
                                            alt="Card image cap"
                                        />
                                    </Card> */}
                                </CardDeck>
                                <div className='container--editbox'>
                                    <form>
                                        <div className='edit--header'>
                                            <div className='header--title'>
                                                Name: <input
                                                    type='text'
                                                    name='name'
                                                    value={this.state.name}
                                                    onChange={this.handleInput}
                                                    className='edit--input'
                                                />
                                            </div>
                                            <div className='edit--footer'>
                                                Worn on: <input
                                                    type='text'
                                                    name='lastWorn'
                                                    value={this.state.lastWorn}
                                                    onChange={this.handleInput}
                                                    className='edit--input'
                                                />
                                            </div>
                                        </div>
                                        <div className='edit--buttons'>
                                            <button className='edit--submit' onClick={this.submitChanges}>Submit</button>
                                            <button className='edit--cancel' onClick={this.redirectArchive}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                                <div className='container--archive'>
                                    Loading Outfit
                    </div>
                            )}
                    </div>
                }

            </div>
        )
    }
}

export default withRouter(OutfitEdit);