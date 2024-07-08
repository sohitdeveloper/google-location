// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import { Search, GpsFixed } from "@material-ui/icons";
import { InputAdornment, InputLabel, Typography } from "@mui/material";
const apiKey = "AIzaSyDL9J82iDhcUWdQiuIvBYa0t5asrtz3Swk";
const mapApiJs = "https://maps.googleapis.com/maps/api/js";
const geocodeJson = "https://maps.googleapis.com/maps/api/geocode/json";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";

const focusedTextFieldStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "#28282e",
    borderRadius: "4px",
  },
  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: "#B60A0A",
  },
  "& .MuiInputLabel-root": {
    // marginTop: "-8px",
    // color: "red",
  },
  "& .MuiInputBase-input:-webkit-autofill": {
    "-webkit-box-shadow": "0 0 0 30px none inset",
    backgroundColor: "transparent",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "gray",
  },
  "& .MuiOutlinedInput-input.Mui-disabled": {
    opacity: "2",
    WebkitTextFillColor: "#d0cdcd",
  },
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: "#4C4C4C",
  },

  "& .MuiInputBase-root:after": {
    borderBottom: "2px solid gray",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#F0C94A",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    color: "#DC4E4E",
  },
};

// load google map api js

function loadAsyncScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    Object.assign(script, {
      type: "text/javascript",
      async: true,
      src,
    });
    script.addEventListener("load", () => resolve(script));
    document.head.appendChild(script);
  });
}

const extractAddress = (place) => {
  const address = {
    city: "",
    state: "",
    zip: "",
    country: "",
    plain() {
      const city = this.city ? this.city + ", " : "";
      const zip = this.zip ? this.zip + ", " : "";
      const state = this.state ? this.state + ", " : "";
      return city + zip + state + this.country;
    },
  };

  if (!Array.isArray(place?.address_components)) {
    return address;
  }

  place.address_components.forEach((component) => {
    const types = component.types;
    const value = component.long_name;

    if (types.includes("locality")) {
      address.city = value;
    }

    if (types.includes("administrative_area_level_2")) {
      address.state = value;
    }

    if (types.includes("postal_code")) {
      address.zip = value;
    }

    if (types.includes("country")) {
      address.country = value;
    }
  });

  return address;
};

function AutoLocation(props) {
  const searchInput = useRef(null);
  const [address, setAddress] = useState({});

  // init gmap script
  const initMapScript = () => {
    // if script already loaded
    if (window.google) {
      return Promise.resolve();
    }
    const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src);
  };

  // do something on address change
  const onChangeAddress = (autocomplete) => {
    const place = autocomplete.getPlace();
    setAddress(extractAddress(place));
  };

  // init autocomplete
  const initAutocomplete = () => {
    if (!searchInput.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      searchInput.current
    );
    autocomplete.setFields(["address_component", "geometry"]);
    autocomplete.addListener("place_changed", () =>
      onChangeAddress(autocomplete)
    );
  };

  const reverseGeocode = ({ latitude: lat, longitude: lng }) => {
    const url = `${geocodeJson}?key=${apiKey}&latlng=${lat},${lng}`;
    searchInput.current.value = "Getting your location...";
    fetch(url)
      .then((response) => response.json())
      .then((location) => {
        const place = location.results[0];
        const _address = extractAddress(place);
        setAddress(_address);
        searchInput.current.value = _address.plain();
      });
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        reverseGeocode(position.coords);
      });
    }
  };

  // load map script after mounted
  useEffect(() => {
    initMapScript().then(() => initAutocomplete());
  }, []);

  return (
    <div className="App">
      <InputLabel htmlFor="outlined-error-helper-text">
        <Typography className="text-white text-xs mb-2">Location</Typography>
      </InputLabel>
      <TextField
        inputRef={searchInput}
        placeholder="Search location...."
        id="outlined-error-helper-text"
        sx={focusedTextFieldStyle}
        variant="outlined"
        InputProps={{
          className: "h-full",
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <CancelIcon />
            </InputAdornment>
          ),
        }}
        {...props}
      />
      <div>
        <div className="address">
          <p>
            City: <span>{address.city}</span>
          </p>
          <p>
            State: <span>{address.state}</span>
          </p>
          <p>
            Zip: <span>{address.zip}</span>
          </p>
          <p>
            Country: <span>{address.country}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AutoLocation;
