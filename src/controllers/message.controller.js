import ConversationModel from "../models/conversation.model";

export const sendMessage = async (req, res) => {
    try {
        const {id:recieverId} = req.params;

        const senderId = req.user._id.toString()

        let conversation = await ConversationModel.findOne({
            participants:{$all : [recieverId, senderId]}
        })

        if(!conversation){
            conversation = await ConversationModel.create({
                participants:[senderId,recieverId]
            })
        }

        

    } catch (error) {
        console.log(error);
    }
};
