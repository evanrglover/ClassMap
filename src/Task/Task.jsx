import React from "react";
import "./Task.module.css";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

export const Task = ({id, title}) =>  {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({ id })

    const style = {
        transition,
        transform: transform ? CSS.Transform.toString(transform) : undefined,
    };

    return (
    <div ref={setNodeRef} {... attributes} {... listeners} className="task">
        <label className="checkBox"/>
        {title}
    </div>

    );
};