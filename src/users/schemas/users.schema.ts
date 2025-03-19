import { Document} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Field, ObjectType} from "@nestjs/graphql";

// export type UserDocument = HydratedDocument<User>


@ObjectType()
@Schema({ timestamps: true })
export class User extends Document{

    @Field()
    @Prop({ required: true, unique: true })
    username: string;

    @Field()
    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);